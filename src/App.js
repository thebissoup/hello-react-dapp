import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import { ethers } from "ethers";
import lightball1 from "./images/lightball1.png";
import lightball3 from "./images/lightball3.png";
import lightball5 from "./images/lightball5.png";
import CoinTransfer from "./artifacts/contracts/CoinTransfer.sol/CoinTransfer.json";

// Update with the contract address logged out to the CLI when it was deployed
const cointransferAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  // store receiver address
  const [receiverAddress, setReceiverAddressValue] = useState();
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");

  //contract balance
  const [balance, setBalance] = useState();
  useEffect(() => {
    async function getBalance() {
      if (typeof window.ethereum !== "undefined") {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          cointransferAddress,
          CoinTransfer.abi,
          signer // if you want updated data it has to be signer
        );
        try {
          const data = await contract.getUserBalance();
          setBalance(HexWeiToCFA(data._hex).toLocaleString());
        } catch (err) {
          console.log("Error: ", err);
        }
      }
    }
    getBalance();
  }, []);

  // request access to the user's MetaMask account
  async function requestAccount() {
    let payload = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccounts(payload);
  }

  async function sendTransaction() {
    await window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0],
            to: receiverAddress,
            value: depositAmount, //<--WIP
            // gasPrice: "0x09184e72a000",
            gas: "0x08FC",
          },
        ],
      })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error);
  }

  function DecEthToHexWei(float) {
    return "0x" + (float * 10 ** 18).toString(16);
  }

  function HexWeiToCFA(string) {
    //may use API for current exchange rate
    const EURO_PER_ETH = 1445.43;
    const DOLLAR_PER_EURO = 1.07;
    console.log(parseInt(string, 16) / 10 ** 18, "ETH");

    return (parseInt(string, 16) / 10 ** 18) * EURO_PER_ETH * DOLLAR_PER_EURO;
  }

  // async function getBalance() {
  //   if (typeof window.ethereum !== "undefined") {
  //     await requestAccount();
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const contract = new ethers.Contract(
  //       cointransferAddress,
  //       CoinTransfer.abi,
  //       provider
  //     );
  //     try {
  //       const data = await contract.getBalance();
  //       setBalance(HexWeiToCFA(data._hex));
  //       console.log("data: ", data);
  //     } catch (err) {
  //       console.log("Error: ", err);
  //     }
  //   }
  // }

  async function sendMoney() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(); // -> we want contract to act on the behalf of the account owner/signee
      const contract = new ethers.Contract(
        cointransferAddress,
        CoinTransfer.abi,
        signer
      );
      const transfer = await contract.sendMoney(receiverAddress);
      await transfer.wait();
      console.log("Deposit Processed");
    }
  }

  async function withdrawMoney() {
    if (withdrawalAmount <= 0) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(); // -> we want contract to act on the behalf of the account owner/signee
      const contract = new ethers.Contract(
        cointransferAddress,
        CoinTransfer.abi,
        signer
      );
      const withdraw = await contract.withdrawMoney(withdrawalAmount);
      await withdraw.wait();
      console.log("Withdrawal Processed");
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img
          src={lightball1}
          className="resize light-ground position-1 floating"
        ></img>
        <img
          src={lightball3}
          className="resize light-ground position-3 floating"
        ></img>
        <img
          src={lightball5}
          className="resize light-ground position-5 floating"
        ></img>
        <section className="clear-card">
          <h1>Total Balance:</h1>
          <h3>$ {balance} of ETH</h3>
          <h3>Deposit Address (In Hex)</h3>
          <input
            onChange={(e) => setReceiverAddressValue(e.target.value)}
          ></input>
          {/* <button onClick={sendMoney}>Send Money</button> */}
          <h3>Deposit Amount in ETH</h3>
          <input
            type="number"
            min="0"
            onChange={(e) =>
              setDepositAmount(DecEthToHexWei(parseFloat(e.target.value)))
            }
          ></input>
          <button onClick={sendTransaction}>Deposit Money</button>
        </section>
      </header>
    </div>
  );
}

export default App;
