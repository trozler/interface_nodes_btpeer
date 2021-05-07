# Will accept encoding of image and also email
# Will then create a BTPeerConnection and send message.
import sys
from btpeer import BTPeerConnection
import socket
import random


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
    msgreply = []
    try:
        peerconn = BTPeerConnection(pid, host, port, debug=False)
        peerconn.senddata(msgtype, msgdata)

        print('Sent %s: %s' % (pid, msgtype))

        if waitreply:
            onereply = peerconn.recvdata()
            while (onereply != (None, None)):
                msgreply.append(onereply)
                print('Got reply %s: %s'
                      % (pid, str(msgreply)))
                onereply = peerconn.recvdata()

        peerconn.close()
    except KeyboardInterrupt:
        raise
    except Exception as e:
        traceback.print_exc()

    return msgreply


def main():
    if len(sys.argv) != 3:
        print("not correct command line arguments.")
        sys.exit(0)

    email = sys.argv[1]
    encodedImage = sys.argv[2]

    serverhost = initserverhost()
    senderName = '%s:%d' % (serverhost, 3000)

    print("senderName:", senderName)
    print("email:", email)
    print("encodedImage:", encodedImage)

    message_data = {
        "sender": senderName,
        "email": email,
        "encodedImage": encodedImage,
        "type": "INIT",
        "id": random.randint(0, 100000),
    }

    connectandsend(serverhost, 1119, "INIT", sender,
                   message_data, senderName)


if __name__ == "__main__":
    main()

# const message = {
#     encodedImage: encodedImage,
#     type: "INIT",
#     email: email,
# }
