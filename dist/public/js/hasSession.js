const $token = localStorage.getItem("token");
if ($token === "" || !$token) {
    localStorage.removeItem("token")
    window.location = "/"
}

const GetSession = () => localStorage.getItem("token")