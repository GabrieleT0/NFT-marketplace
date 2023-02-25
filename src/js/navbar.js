import {
    Link
} from "react-router-dom";
import { Navbar, Nav, Button, Container } from 'react-bootstrap'
import nftimg from '../images/nftimg.png'

const Navigation = ({ web3Handler, account }) => {
    return (
        <Navbar expand="lg" variant="dark" id='navbar'>
            <Container>
                <Navbar.Brand>
                    <img src={nftimg} width="45" height="45" className="" alt="" />
                    <span id='title'>&nbsp; D-Art</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto" id='li'>
                        <Nav.Link as={Link} to="/" id='home'>Home</Nav.Link>
                        <Nav.Link as={Link} to="/create" id='create'>Sell</Nav.Link>
                        <Nav.Link as={Link} to="/my-listed-items" id='liItem'>My Listed Items</Nav.Link>
                        <Nav.Link as={Link} to="/my-purchases"id='purch'>My Purchases</Nav.Link>
                    </Nav>
                    <Nav>
                        {account ? (
                            <Nav.Link
                                href={`https://etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button nav-button btn-sm mx-4">
                                <Button variant="outline-light" id='account'>
                                    {account.slice(0, 5) + '...' + account.slice(38, 42)}
                                </Button>

                            </Nav.Link>
                        ) : (
                            <Button id='walletBtn'onClick={web3Handler} variant="outline-light">Connect Wallet</Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

}

export default Navigation;