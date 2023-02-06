import{
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import Navigation from './navbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Marketplace from '../contractsData/Marketplace.json'
import NFT from '../contractsData/NFT.json'
import Home from './Home'
import Create from './Create'
import MyListedItems from './myListedItem'
import MyPurchases from './myPurchases'
import { Spinner } from 'react-bootstrap'

import './App.css';

function App(){
  const [loading, setLoading] = useState(true)
  const[account, setAccount] = useState(null)
  const [nft,setNFT] = useState(null)
  const [marketplace,setMarketplace] = useState({})
  const[marketplaceAddr,setMarketplaceAddr] = useState({})
  const[nftAddr, setNftAddr] = useState({})
  const web3Handler = async () => {
    //Get provider from Meramask
    const web3Modal = new Web3Modal()
    const provider = await web3Modal.connect()
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])

    loadContracts(web3,networkId)
  }
  const loadContracts = async (web3,networkId) => {
      //Get deployed copies of contracts
      const marketplaceAddr = Marketplace.networks[networkId].address
      const marketplace = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
      setMarketplace(marketplace)
      setMarketplaceAddr(marketplaceAddr)
      const nftAddr = NFT.networks[networkId].address
      const nft = new web3.eth.Contract(NFT.abi, NFT.networks[networkId].address)
      setNFT(nft)
      setNftAddr(nftAddr)
      setLoading(false)
  }
  return (
    <BrowserRouter>
      <div className="App">
          <Navigation web3Handler={web3Handler} account={account} />
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                //here passing the smart contract to the home component
                <Home marketplace={marketplace} nft={nft} marketplaceAddr={marketplaceAddr} nftAddr={nftAddr} account={account} />
              } />
              <Route path="/create" element={
                <Create marketplace={marketplace} nft={nft} marketplaceAddr={marketplaceAddr} nftAddr={nftAddr} account={account}/>
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account} />
              } />
              <Route path="/my-purchases" element={
                <MyPurchases marketplace={marketplace} nft={nft} account={account} />
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}
  export default App;