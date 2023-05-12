ONE=J34OXMKGZQ4ILXHMFO4Z7DJ34JCIORHDH6XXFF437HWY7BGQSRSA72NQLY

TWO=K6T7US5TSEKHYIKHU7JPQF6MQZXX5ZHVVJRIXLUAEVOJX2P3PSW3VHYJAI

goal app create --creator $ONE --approval-prog /data/build/approval.teal --clear-prog /data/build/clear.teal --global-byteslices 0 --global-ints 0 --local-byteslices 7 --local-ints 1

app index 1

goal app create --creator $ONE --approval-prog build/approval.teal --clear-prog build/clear.teal --global-byteslices 0 --global-ints 0 --local-byteslices 7 --local-ints 1

app id 204479349
app acc I2MSZADVDRHRQLCPZK7NS4U4PKTU4TTBXAWLKZ4YD6RZM7NWY3J53BH37I
