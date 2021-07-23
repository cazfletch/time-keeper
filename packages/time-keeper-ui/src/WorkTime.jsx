import React, {useEffect, useState} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {Button, Form} from "react-bootstrap";

function WorkTime({user}) {

    const initialStartTime = '09:00';
    const initialEndTime = '17:30';
    const [currentDate, onDateChange] = useState(new Date());
    const [startTime, setStartTime] = useState(initialStartTime);
    const [endTime, setEndTime] = useState(initialEndTime);

    useEffect(() => {

        getWorkTime();
        function getWorkTime() {

            const params = {
                username: user.username,
                date: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}`
            };

            const url = new URL(process.env.REACT_APP_URL + '/api/worktime');
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            const response = fetch(url, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            }).then(res => res.json())
                .then(
                    (result) => {
                        if (result && result.startTime) {
                            setStartTime(result.startTime);
                        } else {
                            setStartTime(initialStartTime);
                        }
                        if (result && result.endTime) {
                            setEndTime(result.endTime);
                        } else {
                            setEndTime(initialEndTime);
                        }
                    },
                    (error) => {
                        //TODO
                    }
                );

        }
    }, [currentDate]);


    function onStartTimeChange(e) {
        setStartTime(e.target.value);
    }

    function onEndTimeChange(e) {
        setEndTime(e.target.value);
    }

    async function onFormSubmit(e) {
        e.preventDefault();

        const data = {
            username: user.username,
            date: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}`,
            startTime,
            endTime
        };

        const dataString = JSON.stringify(data);

        const url = process.env.REACT_APP_URL + '/api/worktime';
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
        <div>
            <h2>Work Time</h2>
            <Calendar
                onChange={onDateChange}
                value={currentDate}
            />
            <div>
                <Form onSubmit={onFormSubmit}>
                    <Form.Group controlId="formStartTime">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control type="time" placeholder="Enter start time" name="startTime" value={startTime}
                                      onChange={onStartTimeChange}/>
                    </Form.Group>
                    <Form.Group controlId="formEndTime">
                        <Form.Label>End Time</Form.Label>
                        <Form.Control type="time" placeholder="Enter end time" name="endTime" value={endTime}
                                      onChange={onEndTimeChange}/>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Update
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default WorkTime;
