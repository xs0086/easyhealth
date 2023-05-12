import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { PeraWalletConnect } from "@perawallet/connect";
import algosdk, { waitForConfirmation } from "algosdk";
import { useEffect, useState } from "react";
import Fade from "react-bootstrap/Fade";
import "bootstrap/dist/css/bootstrap.min.css";
import picM from "../assets/MT.jpg";
import picAM from "../assets/AM.jpg";

// import "./Patient.css";
import "./Lab.css";
import "../App.css";

//ONE=IDBUVVCCLGGVRN23SUDWKYPCV5KWMU5LDXQCWM5WFKLNGSZ2XAOZUXU6OA
//TWO=R3FOPO5G25JA265G6A7KEAZN7RDUL5QZTRSJQXGY67YBZ7HPSERXRNS6OA

const peraWallet = new PeraWalletConnect();

const appIndex = 204479639;
const appAddress = "MOLBITTNVVCFHE772TONFOGS7MSXDWJSMGDDBETNJ5YNNDAAGRDGNLXYXI";

const algod = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  443
);

function Lab() {
  // pop over
  const popover = (
    // popover-basic izmeni u cssu
    <Popover id="popover-basic">
      <Popover.Header as="h3">Success</Popover.Header>
      <Popover.Body>Test is done.</Popover.Body>
    </Popover>
  );
  // for collaps
  const [open, setOpen] = useState(false);

  //pop up
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [accountAddress, setAccountAddress] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress; //convert string to boolean
  const [owner, setOwner] = useState(null);
  const [real_lbo, setRealLBO] = useState(null);

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        console.log(accounts);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));
  }, []);
  return (
    <Container className="lab">
      <div className="first-lab">
        <div className="first-col">
          <button
            className="connect btn"
            onClick={
              isConnectedToPeraWallet
                ? handleDisconnectWalletClick
                : handleConnectWalletClick
            }
          >
            {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
          </button>
        </div>
        <div className="first-col">
          <button className="optin btn" onClick={() => optInRpsApp()}>
            OptIn
          </button>
        </div>
      </div>
      <button
        className="btn"
        aria-controls="example-fade-text"
        aria-expanded={open}
        onClick={() => {
          setOwner(false);
          setOpen(!open);
        }}
      >
        Start COVID-19 test
      </button>
      <Fade in={open}>
        <div id="example-fade-text">
          <div>
            <OverlayTrigger trigger="click" placement="top" overlay={popover}>
              <button
                variant="success"
                class="content"
                onClick={
                  !!owner === true
                    ? () =>
                        startRpsApplication(
                          "L34upX89v0DwCj2SsUl3iDHNI/OZsdze3lxJVCG2mMA=",
                          "12345678912"
                        )
                    : () => joinRpsApplication("4", "2", "6")
                }
              >
                COVID-19 rapid antigen test
              </button>
            </OverlayTrigger>
          </div>
        </div>
      </Fade>
    </Container>
  );

  function handleConnectWalletClick() {
    peraWallet
      .connect()
      .then((newAccounts) => {
        peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    setAccountAddress(null);
  }

  async function optInRpsApp() {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();

      const actionTx = algosdk.makeApplicationOptInTxn(
        accountAddress,
        suggestedParams,
        appIndex
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await algod.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(algod, txId, 2);
    } catch (e) {
      console.error(`There was an error calling the rps app: ${e}`);
    }
  }
  async function startRpsApplication(
    hashed_LBO = "L34upX89v0DwCj2SsUl3iDHNI/OZsdze3lxJVCG2mMA=",
    real_lbo = "12345678912"
  ) {
    try {
      setRealLBO(real_lbo);
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("start")),
        new Uint8Array(Buffer.from(hashed_LBO, "base64")),
      ];

      const accounts = [
        "R3FOPO5G25JA265G6A7KEAZN7RDUL5QZTRSJQXGY67YBZ7HPSERXRNS6OA", //kod pere je drugi acc
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      let payTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: accountAddress,
        to: appAddress,
        amount: 100000,
        suggestedParams: suggestedParams,
      });

      let txns = [actionTx, payTx];
      algosdk.assignGroupID(txns);

      const actionTxGroup = [
        { txn: actionTx, signers: [accountAddress] },
        { txn: payTx, signers: [accountAddress] },
      ];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);

      console.log(signedTxns);
      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      // checkCounterState();
    } catch (e) {
      console.error(`There was an error calling the rps app: ${e}`);
    }
  }

  async function joinRpsApplication(crp, wbc, lym) {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("accept")),
        new Uint8Array(Buffer.from(crp)),
        new Uint8Array(Buffer.from(wbc)),
        new Uint8Array(Buffer.from(lym)),
      ];

      const accounts = [
        "IDBUVVCCLGGVRN23SUDWKYPCV5KWMU5LDXQCWM5WFKLNGSZ2XAOZUXU6OA", //kod pere je prvi acc
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);
      const txns = [signedTxns];

      console.log(signedTxns);

      //const dr = algosdk.createDryrun(algod, txns);

      //test debugging
      //const dryRunResult = await algod.dryrun(dr).do();
      //console.log(dryRunResult);

      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      console.log(result);
      // let payTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      //   from: accountAddress,
      //   to: appAddress,
      //   amount: 100000,
      //   suggestedParams: suggestedParams,
      // });

      // let txns = [actionTx, payTx];
      // algosdk.assignGroupID(txns);

      // const actionTxGroup = [
      //   { txn: actionTx, signers: [accountAddress] },
      //   { txn: payTx, signers: [accountAddress] },
      // ];

      // const signedTxns = await peraWallet.signTransaction([actionTxGroup]);

      // console.log(signedTxns);
      // const { txId } = await algod.sendRawTransaction(signedTxns).do();
      // const result = await waitForConfirmation(algod, txId, 4);
      // checkCounterState();
    } catch (e) {
      console.error(`There was an error calling the rps app: ${e}`);
    }
  }
}
export default Lab;
