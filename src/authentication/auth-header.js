export function authHeader()
{
    // check if access token cookie exist otherwise we logout user
    const isLoginPage = location.pathname.includes("/login") || location.pathname.includes("/logout");
    if (!isLoginPage) {
        //location.replace("/logout");
    }
    console.log(isLoginPage);

    // return authorization header with basic auth credentials
    const authdata = localStorage.getItem('authdata');
    console.log(authdata);

    if (authdata) {
        return {'Authorization': 'Basic ' + authdata};
    } else {
        return {};
    }
}
