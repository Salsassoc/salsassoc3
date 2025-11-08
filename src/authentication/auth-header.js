export function authHeader()
{
    // check if access token cookie exist otherwise we logout user
    const isCookieNotAvailable = (!document.cookie || !document.cookie.includes("access_token"));
    const isLoginPage = location.pathname.includes("/login") || location.pathname.includes("/logout");
    if (isCookieNotAvailable && !isLoginPage) {
        location.replace("/logout");
    }

    // return authorization header with basic auth credentials
    const authdata = localStorage.getItem('authdata');

    if (authdata) {
        return {'Authorization': 'Basic ' + authdata};
    } else {
        return {};
    }
}
