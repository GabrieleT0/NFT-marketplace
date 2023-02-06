import { useState, useEffect} from 'react'
import { Row, Col, Card} from 'react-bootstrap'
import Web3 from 'web3';

export default function MyPurchases({ marketplace, nft, account}) {
    const [loading, setLoading] = useState(true)
    const [purchases, setPurchases] = useState([])
    const loadPurchasedItems = async () => {
        //Fetch purchased items from marketplace by querying Bought events with the buyer set as the user
        const results = await marketplace.getPastEvents("Bought",{filter : {buyer: account}})
        console.log(results)
        //const results = await marketplace.methods.queryFilter(filter)
        //Fetch metadata of each nft and add that to listedItem object.
        //this return an array, result.map do multiple asyncrnous actions, so is needed to cast with Promise.all() in order to assign the return mapped array to the purchases variable
        const purchases = await Promise.all(results.map(async i =>{
            //fetch arguments from each result
            i = i.returnValues
            console.log(i)
            //get uri url from NFT contract
            const uri = await nft.methods.tokenURI(i.tokenId).call()
            // use uri to fetch the nft metadata stored on ipfs
            const response = await fetch(uri)
            const metadata = await response.json()
            //get total price of item (item price + fee)
            const totalPrice = await marketplace.methods.getTotalPrice(i.itemId).call()
            //define listed item object
            let purchasedItem = {
                totalPrice,
                price: i.price,
                itemId: i.itemId,
                name: metadata.name,
                description: metadata.description,
                image: metadata.image
            }
            return purchasedItem
        }))
        setLoading(false)
        setPurchases(purchases)
    }
    useEffect(() =>{
        loadPurchasedItems()
    }, [])
    if (loading) return (
        <main style={{padding: "1rem 0"}}>
            <h2>Loading...</h2>
        </main>
    )
    return (
        <div className='flex justify-center'>
            {purchases.length > 0 ?
                <div className='px-5 container'>
                    <Row xs={1} md={2} lg={4} className='g-4 py-5'>
                        {purchases.map((item,idx) =>(
                            <Col key={idx} className='overflow-hidden'>
                                <Card >
                                    <Card.Img variant='top' src={item.image} />
                                    <Card.Footer>{Web3.utils.fromWei(item.totalPrice)} ETH</Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>            
                </div>
            : (
                <main style={{ padding:'1rem 0'}}>
                    <h2>No purchases</h2>
                </main>
            )}
        </div>
    )
}