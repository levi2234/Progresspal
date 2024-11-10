
from .webapp.webapp import start_web_server


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
    
    start_parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    args = parser.parse_args()
    
    # Call the start function if the `start` command is used
    if args.command == "start":
        start_web_server(args.host, args.port, args.debug, args.verbose)