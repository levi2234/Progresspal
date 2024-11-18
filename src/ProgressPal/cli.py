
from .webapp.webapp import start_web_server
import pyngrok
from pyngrok import ngrok

def CLI():
    import argparse

    parser = argparse.ArgumentParser(description='Start the ProgressPal web server')
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Define the "start" subcommand
    start_parser = subparsers.add_parser("start", help="Start ProgressPal")
    
    
    parser.add_argument('--host', type=str, default="127.0.0.1", help='Host name for the web server')
    parser.add_argument('--port', type=int, default=5000, help='Port number for the web server')
    parser.add_argument('--debug', type=bool, default=False, help='Enable debug mode')
    parser.add_argument('--verbose', type=bool, default=True, help='Enable web log')
    parser.add_argument('--ngrok_auth', type=str, default=None, help='Ngrok authentication token')
    
    parser.add_argument('--ngrok', action='store_true', help='Enable ngrok tunneling')
    
    start_parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    args = parser.parse_args()
    
    # Set the ngrok authentication token if provided
    if args.ngrok_auth:
        pyngrok_config = pyngrok.conf.PyngrokConfig(auth_token=args.ngrok_auth)
        pyngrok_config.save()
    
    if args.ngrok:
        print("Ngrok tunneling enabled.")
        pyngrok_tunnel = ngrok.connect(args.port)
        print(f"Ngrok tunnel URL: {pyngrok_tunnel.public_url}")
    
    # Call the start function if the `start` command is used
    if args.command == "start":
        start_web_server(args.host, args.port, args.debug, args.verbose)