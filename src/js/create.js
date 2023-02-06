import {useState} from 'react'
import {Row, Form, Button} from 'react-bootstrap'
import Web3 from 'web3';
import {Buffer} from 'buffer';
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
//this allow us to upload the metadata about the newly created NFT to IPFS
const client = ipfsHttpClient('http://localhost:5002')
const Create = ({ marketplace, nft, marketplaceAddr, nftAddr,account}) => {
    const [image, setImage] = useState('')
    const [price, setPrice] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    //function triggered each time that there is a change to the input field in the create form
    //filed that user use to upload the nft image
    const uploadToIPFS = async (event) => {
        event.preventDefault()
        //fetch file from the event
        const file = event.target.files[0]
        if(typeof file !== 'undefined'){
            try {
                const result = await client.add(file)
                console.log(result)
                setImage(`http://127.0.0.1:9090/ipfs/${result.path}`)
                } catch (error) {
                    console.log("ipfs image upload error: ",error)
            }
        }
    }
    const createNFT = async () => {
        if (!image || !price || !name || !description) return
        try {
            const result = await client.add(JSON.stringify({image, name, description}))
            minThenList(result)
        } catch (error){
            console.log("ipfs uri upload error: ",error);
        }
    }

    const minThenList = async (result) => {
        const uri = `http://127.0.0.1:9090/ipfs/${result.path}`
        //mint nft
        await(await nft.methods.mint(uri).send({from: account}))
        // get tokenId of new nft
        const id = await nft.methods.tokenCount().call()
        // approve marketplace to spend nft
        await (await nft.methods.setApprovalForAll(marketplaceAddr,true).send({from:account}))
        // add nft to marketplace
        const listingPrice =  Web3.utils.toWei(price.toString(), "ether")
        await (await marketplace.methods.makeItem(nftAddr,id,listingPrice).send({from:account}))
    }
    return (
        <div className='container-fluid mt-5'>
            <div className='row'>
                <main role="main" className='col-lg-12 mx-auto' style={{ maxWidth: '1000px'}}>
                    <div className='content mx-auto'>
                        <Row className='g-4'>
                            <Form.Control
                                type = 'file'
                                name = 'file'
                                onChange = {uploadToIPFS}
                            />
                            <Form.Control
                                onChange={(e) => setName(e.target.value)}
                                size = 'lg'
                                type = 'text'
                                placeholder = 'Name'
                            />
                            <Form.Control
                                onChange={(e) => setDescription(e.target.value)}
                                size = 'lg'
                                as = 'textarea'
                                placeholder='Description'
                            />
                            <Form.Control
                                onChange={(e) => setPrice(e.target.value)}
                                size = 'lg'
                                type = 'number'
                                placeholder = 'Price in ETH'
                            />
                            <div className='d-grid px-0'>
                                <Button onClick={createNFT} variant='primary' size='lg'>
                                    Create & List NFT!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Create