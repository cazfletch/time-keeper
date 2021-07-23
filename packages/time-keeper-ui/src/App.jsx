import React, {useState, useEffect} from 'react';
import './App.scss';
import Login from './Login';
import Settings from './Settings';
import WorkTime from './WorkTime';


function App() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [user, setUser] = useState([]);

    let display;

    useEffect(() => {

        getUser();

        function getUser() {
            const url = process.env.REACT_APP_URL + '/api/user';
            const response = fetch(url, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors'
            }).then((res) => {
                    if (res.status !== 401) {
                        return res.json()
                    }
                }
            )
                .then(
                    (result) => {
                        setIsLoaded(true);
                        setUser(result);
                    },
                    (error) => {
                        setIsLoaded(true);
                        setError(error);
                    }
                );

        }
    }, []);

    function displayUser() {
        return (
            <div>
                <h2>Hello {user.displayName}</h2>
                <Settings user={user}/>
                <WorkTime user={user}/>
            </div>

        );
    }

    function displayLogin() {
        return <Login/>
    }

    if (error) {
        // @ts-ignore
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {

        let display = user ? displayUser() : displayLogin();

        return (

            <div className="App">
                <header className="Welcome-header">
                    <h1>Welcome to Time Keeper</h1>
                </header>
                {display}
            </div>
        );
    }
}


export default App;
