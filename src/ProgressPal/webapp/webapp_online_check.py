import requests

def webapp_online_check(url, log = False):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            if log:
                print(f"Website is running with (code 200).")
            return True
        else:
            if log:
                print(f"Website returned status code: {response.status_code}")
            return False
    except requests.ConnectionError:
        if log:
            print("Could not connect to the website.")
        return False

# Example usage
# print(webapp_online_check("http://127.0.0.1:5000"))