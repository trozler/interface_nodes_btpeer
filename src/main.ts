import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

class transationMaker {
  signer: ethers.providers.JsonRpcSigner;
  isConected: boolean;
  _trxForm: HTMLFormElement;
  _trxStatus: HTMLElement;
  constructor(signer: ethers.providers.JsonRpcSigner, isConected: boolean) {
    this.sendTransaction = this.sendTransaction.bind(this);
    this.handlePayment = this.handlePayment.bind(this);
    this.signer = signer;
    this.isConected = isConected;

    this._trxStatus = document.getElementById("trx-status");
  }
  updateConnectedStatus(isConnected: boolean) {
    // Update isConnected for donation.

    if (isConnected === true) {
      this.isConected = true;
      this._trxForm.hidden = false;
      this._trxStatus.textContent = "";
    } else {
      this.isConected = false;
      this._trxForm.hidden = true;
      this._trxStatus.textContent = "Connect wallet to use service.";
    }
  }

  setUpTransactions() {
    this._trxForm = document.getElementById("pay-form") as HTMLFormElement;

    console.log("form element:", this._trxForm);

    if (!this._trxForm) {
      return;
    }

    // TODO: connect wallet before can donate.
    // TODO: only allow test chain transactions.
    if (!this.isConected) {
      this._trxForm.hidden = true;
      this._trxStatus.textContent = "Connect wallet to use service.";
    }

    // TODO: Need to check if connected wallet every time..
    // Don't submit form but gather info for AJAX
    this._trxForm.addEventListener("submit", this.handlePayment);
  }

  async handlePayment(evt: Event) {
    evt.preventDefault();

    // Get amount and address.
    const form = evt.target as HTMLFormElement;

    const address: string = "0x1c818289c33871A642497887432DaedA27054233";
    const value: string = "0.001";

    try {
      await this.sendTransaction(address, value);
    } catch (e) {
      console.error("Failed to send transaction", e);
      throw e;
    }

    form.submit();

    return false;
  }

  async sendTransaction(address: string, value: string) {
    const tx = {
      to: address,
      value: ethers.utils.parseEther(value),
    };

    try {
      // In metamask only sign message and send transaction are supported.
      const txRes = await this.signer.sendTransaction(tx);
      console.log(":::transaction res", txRes);
    } catch (e) {
      this._trxStatus.textContent = "Payment failed for following reason:" + e.message;
      throw e;
    }

    this._trxStatus.textContent = "Payment succeeded";
  }
}

class DApp {
  _chainId: number;
  currentAccount: string;
  ethersProvider: ethers.providers.Web3Provider;
  externalProvider: ethers.providers.ExternalProvider;
  signer: ethers.providers.JsonRpcSigner;
  trxMaker: transationMaker;
  /**
   *
   * @param ethereum The provider injected.
   * This is an external provider that should be used to connect to the provider.
   * This is not the same as an external provider.
   * We create an ethers.js provider so we get the best of both world:
   *  - ether.js provider lets you
   *
   * The external provider is an EIP-1193 provider or possibly another provider.
   * An EIP-1193 must have a "request" or "send" method, the first one is used.
   */
  constructor(ethereum: any, isConected: boolean) {
    this._startDapp = this._startDapp.bind(this);

    // The "any" network will allow spontaneous network changes
    this.ethersProvider = new ethers.providers.Web3Provider(ethereum, "any");
    this.externalProvider = this.ethersProvider.provider;
    this.signer = this.ethersProvider.getSigner();

    /**
     * @description We will call .getSigner([addressOrIndex]) on ethersProvider, to get a signer to complete transactions.
     * If no arg provided will default to using current account.
     */
    this.currentAccount = null;
    this._chainId = null;

    // While you are awaiting the call to eth_requestAccounts, you should disable any buttons the user can click to initiate the request. MetaMask will reject any additional requests while the first is still pending.
    const button = document.getElementById("connectButton");
    button.addEventListener("click", this._startDapp);

    /**********************************************************/
    /*           Handle chainChanged (per EIP-1193)           */
    /**********************************************************/
    this.ethersProvider.on("network", function (newNetwork, oldNetwork) {
      // So, if the oldNetwork exists, it represents a changing network.
      if (oldNetwork) {
        window.location.reload();
      }
    });

    this.trxMaker = new transationMaker(this.signer, isConected);
    this.trxMaker.setUpTransactions();
  }

  async _startDapp(event: MouseEvent) {
    const element = event.target as HTMLButtonElement;

    /***************** Disable button. ***********************/
    element.disabled = true;

    /*********************************************/
    /* Access the user's accounts (per EIP-1102) */
    /*********************************************/
    let accounts: Array<string>;
    try {
      accounts = await this.externalProvider.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        this.currentAccount = accounts[0];
      }
    } catch (err) {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log("4001 error, please connect to a wallet if you want to use the service.");
      } else {
        console.error(err);
      }

      // TODO: Should display this message to user.

      return;
    }

    element.disabled = false;
    /***************** Enable button. ***********************/

    /***************** Update button account ***********************/
    const button = document.getElementById("connectButton");
    button.textContent = ` ${this.currentAccount ? this.currentAccount.slice(0, 8) : ""}`;

    this.trxMaker.updateConnectedStatus(true);

    /*****************************************/
    /* Handle accountsChanged (per EIP-1193) */
    /*****************************************/

    // TODO: Update this based on ethers discussion. SHould update UI components.
    // You may want to update have .on("accountsChanged"), in case you want to change account displayed.
  }
}

window.addEventListener("DOMContentLoaded", async function () {
  const ethereum: any = await detectEthereumProvider();
  if (!ethereum) {
    return;
  }

  let isConected = false;
  const accounts: Array<string> = await ethereum.request({ method: "eth_accounts" });
  if (accounts.length > 0) {
    const currentAcconut = accounts[0];
    /***************** Update button account ***********************/
    const button = document.getElementById("connectButton");
    button.textContent = `${currentAcconut.slice(0, 8)}`;
    console.log(":::account already connected.", currentAcconut);
    isConected = true;
  }

  new DApp(ethereum, isConected);
});
