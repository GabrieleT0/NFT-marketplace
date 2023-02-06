import {useState, useEffect} from 'react'
import {Row, Col, Card, Button} from 'react-bootstrap'
import Web3 from 'web3';
//marketplace constract for display the nft and nft contract for retrieve the metadata associated with the nft.
const Home = ({marketplace, nft}) => {
    const [items,setItems] = useState([])
    const [loading,setLoading] = useState(true)
    const loadMarketplaceItems = async () => {
        const itemCount = await marketplace.methods.itemCount().call()
        let items = []
        for(let i = 1; i<= itemCount;i++){
            const item = await marketplace.methods.items(i).call()
            if(!item.sold){
                //getting uri url from nft contract
                const uri = await nft.methods.tokenURI(item.tokenId).call()
                //use uri to fetch the nft metadata stored on ipfs
                console.log(uri)
                const response = await fetch(uri)
                const metadata = await response.json()
                //get total price of item (item price + fee)
                const totalPrice = await marketplace.methods.getTotalPrice(item.itemId).call()
                //add item to items array
                items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
        setItems(items)
        setLoading(false)
    }
    const buyMarketItem = async (item) => {
        //this retun a transaction response, and with .wait() on the transaction response, we wait for the transaction be confermet
        await (await marketplace.methods.purchaseItem(item.itemId, {value: item.totalPrice}).call()).wait()
        //remove the recently purchased itemfrom the marketplace
        loadMarketplaceItems()
    }

    useEffect(() => {
        loadMarketplaceItems()
    }, [])

    //returning a loading page if the marketplace items is not finished of loading from blockchain
    if (loading) return (
        <main style={{padding: "1rem 0"}}>
            <h2>Loading...</h2>
        </main>
    )

    return (
        <div className='flex justify-center'>
        {items.length > 0 ?
            <div className="px-5 container">
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {items.map((item,idx) => (
                        <Col key={idx} className="overflow-hidden">
                            <Card>
                                <Card.Img variant='top' src={item.image} />
                                <Card.Body color="secondary">
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>{item.description}</Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <div className='d-grid'>
                                        <Button onClick={() => buyMarketItem(item)} variant="primary" size='lg'>
                                            Buy for {Web3.utils.fromWei(item.totalPrice)} ETH
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        :(
            <main style={{padding: "1rem 0"}}>
                <h2>No listed assets</h2>
            </main>
        )}
        </div>
    );
}
export default Home