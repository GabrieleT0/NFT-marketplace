import { useState, useEffect} from 'react'
import { Row, Col, Card} from 'react-bootstrap'
import Web3 from 'web3';

function renderSoldItems(items){
    return(
        <>
            <h2>Sold</h2>
            <Row xs={1} md={2} lg={4} className='g-4 py-3'>
                {items.map((item,idx) => (
                    <Col key={idx} className='overflow-hidden'>
                        <Card>
                            <Card.Img variand="top" src={item.image} />
                            <Card.Footer>
                                For {Web3.utils.fromWei(item.totalPrice)} ETH - Recieved {Web3.utils.fromWei(item.price)} ETH
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    )
}

export default function MyListedItems({ marketplace, nft, account}){
    const [loading, setLoading] = useState(true)
    const [listedItems, setListedItems] = useState([])
    const [soldItems, setSoldItems] = useState([])
    const loadListedItems = async () => {
        //load all sold items that the user listed
        const itemCount = await marketplace.methods.itemCount().call()
        let listedItems = []
        let soldItems = []
        for (let indx = 1; indx <= itemCount; indx++){
            const i = await marketplace.methods.items(indx).call()
            console.log(i)
            if (i.seller.toLowerCase() === account.toLowerCase()){
                //get uri url from nft contract
                const uri = await nft.methods.tokenURI(i.tokenId).call()
                //use uri to fetch the nft metadata stored on ipfs
                const response = await fetch(uri)
                const metadata = await response.json()
                // get total price of item (item price + fee)
                const totalPrice = await marketplace.methods.getTotalPrice(i.itemId).call()
                // define listed item object
                let item = {
                    totalPrice,
                    price: i.price,
                    itemId: i.itemId,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                }
                listedItems.push(item)
                console.log(listedItems)
                //add listed item to sold items array is sold
                if(i.sold) soldItems.push(item)
            }
        }
        setLoading(false)
        setListedItems(listedItems)
        setSoldItems(soldItems)
    }
    useEffect(()=> {
        loadListedItems()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0"}}>
            <h2>Loading...</h2>
        </main>
    )
    return (
        <div className="flex justify-center">
            {listedItems.length > 0 ?
                <div className='px-5 py-3 container'>
                    <h2>Listed</h2>
                    <Row xs={1} md={2} lg={4} className="g-4 py-3">
                        {listedItems.map((item,idx) => (
                            <Col key={idx} className='overflow-hidden'>
                                <Card>
                                    <Card.Img variant='top' src={item.image} />
                                    <Card.Footer>{Web3.utils.fromWei(item.totalPrice)} ETH</Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {soldItems.length > 0 && renderSoldItems(soldItems)}
                </div>
            : (
                <main style={{ padding: '1rem 0'}}>
                    <h2>No listed assets</h2>
                </main>
            )}
        </div>
    );
}