# Will accept encoding of image and also email
# Will then create a BTPeerConnection and send message.
import sys
import os
from btpeer import BTPeerConnection
import socket
import random
import json


def initserverhost():
    """ Attempt to connect to an Internet host in order to determine the
    local machine's IP address.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("www.google.com", 80))
    serverhost = s.getsockname()[0]
    s.close()

    return serverhost


def connectandsend(host, port, msgtype, msgdata, pid=None):
    """
    connectandsend( host, port, message type, message data, peer id,
    wait for a reply ) -> [ ( reply type, reply data ), ... ]

    Connects and sends a message to the specified host:port. The host's
    reply, if expected, will be returned as a list of tuples.
    """

    try:
        peerconn = BTPeerConnection(pid, host, port, debug=False)
        peerconn.senddata(msgtype, msgdata)

        print('Sent %s: %s' % (pid, msgtype))

        peerconn.close()
    except KeyboardInterrupt:
        raise
    except Exception as e:
        raise


def main():
    if os.path.exists(os.path.abspath("btpeer/tmp.json")) == False:
        print("tmp.json doesn't exist")
        sys.exit(0)
        return

    with open('btpeer/tmp.json') as f:
        data = json.load(f)

        email = data["email"]
        encodedImage = data["encodedImage"]
        region = data["region"]

        serverhost = initserverhost()
        senderName = '%s:%d' % (serverhost, 3000)

        print("senderName:", senderName)
        print("email:", email)
        print("region:", region)
        print("encodedImage:", encodedImage)

        message_data = {
            "sender": senderName,
            "email": email,
            "encodedImage": encodedImage,
            "type": "INIT",
            "id": random.randint(0, 100000),
            "region": region,
        }

        connectandsend(serverhost, 1119, "INIT",
                       message_data, senderName)


if __name__ == "__main__":
    main()
