export function authHeader()
{
    // return authorization header with basic auth credentials
    const authdata = localStorage.getItem('authdata');
    if (authdata) {
        return {'Authorization': 'Basic ' + authdata};
    } else {
        return {};
    }
}
