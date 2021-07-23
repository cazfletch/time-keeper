function Login() {

    return (

        <div className="Login">
            <div>
                <h2>Login</h2>
                <a href={process.env.REACT_APP_URL + '/auth/github'}>Login with github</a>
            </div>
            <div>
                <h3>Register</h3>
                <a href={process.env.REACT_APP_URL + '/auth/github'}>Register with github</a>
            </div>
        </div>
    );
}

export default Login;
