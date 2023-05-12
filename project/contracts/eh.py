from pyteal import *
import program

def approval():

  #varijable
    local_stakeholder=Bytes("opponent")  #pacijent i lab #byt
    local_crp=Bytes("crp")  #ovde recimo parametri krvi koji se salju jer ne moze drugacije da se predstavi uzorkovanje krvi INT
    local_wbc=Bytes("wbc") #INT
    local_lym=Bytes("lym") #INT 
    local_testing_fee=Bytes("wager")  #placanje testiranja,odmah #int
    local_hash_LBO=Bytes("hashed_LBO") #byt
    local_real_LBO=Bytes("real_LBO") #byt
    local_result=Bytes("result") #byt

    #operacije cemo jos da odredimo
    op_start=Bytes("start")   #pocinje testiranje
    op_accept=Bytes("accept")  #prihvataju testiranje(vadjenje krvi)
    op_resolve=Bytes("resolve") #vraca rezultate krvi tj. da li je pacijent zarazen

    #parametri za uzorak krvi --> CRP<5,WBC(4.5<normalno<10),LYM(0.8<normalno<5) znaci da nema neko upaljenje i tad je antigenski negativan


    @Subroutine(TealType.none)
    def get_ready(account: Expr):
        return Seq(
            App.localPut(account,local_stakeholder,Bytes("")),
            App.localPut(account,local_crp,Bytes("")),
            App.localPut(account,local_wbc,Bytes("")),
            App.localPut(account,local_testing_fee,Int(0)),     
            App.localPut(account,local_lym,Bytes("")),
            App.localPut(account,local_hash_LBO,Bytes("")),
            App.localPut(account,local_real_LBO,Bytes("")),
            App.localPut(account,local_result,Bytes(""))
          
        )
    
    @Subroutine(TealType.uint64)
    def check_if_empty(account:Expr):
        return Return(
            And(
                App.localGet(account,local_stakeholder)==Bytes(""),
                App.localGet(account,local_testing_fee)==Int(0),
                App.localGet(account,local_hash_LBO)==Bytes(""),
                App.localGet(account,local_real_LBO)==Bytes(""),
            )
        )

    perform_checks=Assert(
        And(
            Global.group_size()==Int(2),
            Txn.group_index()==Int(0),
            Gtxn[1].type_enum()==TxnType.Payment,
            Gtxn[1].receiver()==Global.current_application_address(),
            Gtxn[0].rekey_to()==Global.zero_address(),     
            Gtxn[1].rekey_to()==Global.zero_address(),
            App.optedIn(Txn.accounts[1],Global.current_application_id())



        )
    )


    @Subroutine(TealType.none)
    def start_testing():
        return Seq(
            perform_checks,
            Assert(
                And(
                     
                    check_if_empty(Txn.sender()),
                    check_if_empty(Txn.accounts[1]),
            
                )
            ),
            # App.localPut(Txn.sender(),local_crp,Txn.application_args[1]),
            # App.localPut(Txn.sender(),local_wbc,Txn.application_args[2]),
            # App.localPut(Txn.sender(),local_lym,Txn.application_args[3]),
            App.localPut(Txn.sender(),local_testing_fee,Gtxn[1].amount()),
            App.localPut(Txn.accounts[1],local_hash_LBO,Txn.application_args[1]),
             
            Approve()
        )

    # napravi subrutinu check testing fee 
    @Subroutine(TealType.none)
    def accept_testing():

        return Seq(
           
            Assert(  #ako treba dodaj and
                #And( #dodale
                Global.group_size()==Int(1),
                Txn.group_index()==Int(0),
                Gtxn[0].rekey_to()==Global.zero_address(),
                App.optedIn(Txn.accounts[1],Global.current_application_id()),
                # check_testing_fee(local_testing_fee),
                check_testing_fee(App.localGet(Txn.accounts[1], local_testing_fee)),
                #check_if_empty(Txn.sender())
            
            #)
            ),
           
            App.localPut(Txn.sender(),local_stakeholder,Txn.accounts[1]),
            App.localPut(Txn.sender(),local_crp,Txn.application_args[1]),
            App.localPut(Txn.sender(),local_wbc,Txn.application_args[2]),
            App.localPut(Txn.sender(),local_lym,Txn.application_args[3]),
            # App.localPut(Txn.sender(),local_testing_fee,Gtxn[1].amount()),
            #App.localPut(Txn.sender(),local_hash_LBO,Txn.application_args[4]), #mora hash
            Approve()
   
        )

    @Subroutine(TealType.uint64)
    def check_testing_fee(testing_fee:Expr):
        return Seq(
            If(
            testing_fee==Int(100000)
            )
            .Then(
             Return(Int(1))
            )
            .Else(
            Return(Int(0))
            )
        )  
    


    @Subroutine(TealType.none)
    def transfer_wager(acc_index:Expr, testing_fee:Expr):
        return Seq(
        
            InnerTxnBuilder.Begin(),

            
            
            InnerTxnBuilder.SetFields({
                TxnField.type_enum:TxnType.Payment,
                TxnField.receiver:Txn.accounts[acc_index],
                TxnField.amount:testing_fee
            }),
            InnerTxnBuilder.Submit()
            
        )


    @Subroutine(TealType.none)
    def calc_blood(crp: Expr,wbc: Expr, lym: Expr):

        return Seq(
            If(
                Seq(
                    And(
                    crp<=Int(5),
                    wbc>Int(4),
                    wbc>Int(10),
                    lym>Int(1),
                    lym<Int(5)
                    )
                    

                )
            )
            .Then(
                 App.localPut(Txn.sender(),local_result,Bytes("negative")),  
            )
            .Else(
                App.localPut(Txn.sender(),local_result,Bytes("positive"))
            )

        )

    @Subroutine(TealType.none)
    def get_results():
        crp= ScratchVar(TealType.uint64)
        wbc= ScratchVar(TealType.uint64)
        lym= ScratchVar(TealType.uint64)
        lbo= ScratchVar(TealType.uint64)
        testing_fee= ScratchVar(TealType.uint64)       #procita upise u local storage,inner transaction je placanje

        return Seq(
            Assert(
                And(
                    Global.group_size()==Int(1),
                    Txn.group_index()==Int(0),
                    
                    Gtxn[0].rekey_to()==Global.zero_address(),

                    

                    #provera da li je prvi igrac iskren za ruku
                    App.localGet(Txn.accounts[1], local_hash_LBO) == Sha256(Txn.application_args[1]),

                    

                    #Txn.application_args.length()==Int(3)

                    
                )
            ),
            crp.store(Btoi(App.localGet(Txn.accounts[1],local_crp))),
            wbc.store(Btoi(App.localGet(Txn.accounts[1],local_wbc))),
            lym.store(Btoi(App.localGet(Txn.accounts[1],local_lym))),
           # lbo.store(App.localGet(Txn.accounts[0],local_real_LBO)),
            testing_fee.store(App.localGet(Txn.accounts[0],local_testing_fee)),

            calc_blood(crp.load(),wbc.load(),lym.load()),
            transfer_wager(Int(1),testing_fee.load()),
            Approve()

        )  
    

    return program.event(
        init=Approve(),
        opt_in=Seq(
          get_ready(Txn.sender()),
          Approve()
        ),
        no_op=Seq(
            Cond(
                [Txn.application_args[0]==op_start,start_testing()],
                [Txn.application_args[0]==op_accept,accept_testing()],
                [Txn.application_args[0]==op_resolve,get_results()]
            )  ,
           Reject()
        )
    )


def clear():
    return Approve()