import {Accordion, Button, Card, Form} from "react-bootstrap";
import React, {useState, useEffect} from 'react';

function Settings({ user }) {

    const [numHours, setNumHours] = useState(user.numHours);

    useEffect(() => {
        setNumHours(user.numHours);
    }, [user]);

    function onHoursChange(event) {
        setNumHours(event.target.value);
    }

    async function onFormSubmit(e) {
        e.preventDefault();

        const data = user;
        data.numHours = numHours;

        const dataString = JSON.stringify(data);

        const url = process.env.REACT_APP_URL + '/api/settings';
        const response = await fetch(url, {
            method: 'POST', body: dataString,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log(result);
    }

    return (
        <div className="Settings">
            <Accordion>
                <Card>
                    <Card.Header>
                        <Accordion.Toggle as={Button} variant="link" eventKey="0">
                            Settings
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <div className="details">
                                <h2>Enter you details</h2>
                                <Form onSubmit={onFormSubmit}>
                                    <Form.Group controlId="formBasicNumberHours">
                                        <Form.Label>Number of hours to work per week</Form.Label>
                                        <Form.Control type="number" placeholder="Enter number of hours" name="numHours" value={numHours} onChange={onHoursChange}/>
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Update
                                    </Button>
                                </Form>
                            </div>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    );
}

export default Settings;
