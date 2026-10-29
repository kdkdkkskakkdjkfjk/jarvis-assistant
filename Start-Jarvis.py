"""Start the existing JARVIS application with its local data backend."""
import argparse
from logging.handlers import RotatingFileHandler
import logging
import threading
import webbrowser
from jarvis_server import create_server, DATA, PAGE


def main():
    parser=argparse.ArgumentParser(description='JARVIS Ultra lokal starten')
    parser.add_argument('--port',type=int,default=8000)
    parser.add_argument('--no-browser',action='store_true')
    args=parser.parse_args()
    handler=RotatingFileHandler(DATA/'jarvis.log',maxBytes=2_000_000,backupCount=3,encoding='utf-8')
    logging.basicConfig(level=logging.INFO,handlers=[handler,logging.StreamHandler()],format='%(asctime)s %(levelname)s %(message)s')
    server=None
    for port in range(args.port,args.port+20):
        try:
            server=create_server(port)
            break
        except OSError:
            continue
    if server is None:
        raise SystemExit('Kein freier lokaler Port. Alte JARVIS-Server schließen und erneut starten.')
    url=f'http://localhost:{server.server_port}/{PAGE}'
    print('\nJARVIS ULTRA · Backend gestartet\n'+url+'\nDieses Fenster geöffnet lassen. Strg+C beendet JARVIS.\n')
    if server.server_port!=8000:print('Kalender-OAuth: diesen Port bei den erlaubten localhost-Ursprüngen ergänzen.')
    if not args.no_browser:threading.Timer(.7,lambda:webbrowser.open(url)).start()
    try:server.serve_forever()
    except KeyboardInterrupt:print('\nJARVIS beendet.')
    finally:server.server_close()


if __name__=='__main__':main()
