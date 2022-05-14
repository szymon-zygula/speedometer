import subprocess
import tornado.ioloop
import tornado.web
import tornado.websocket
import time

PORT = 8888
# TODO
SPEED_PATH = '/home/szymon/Repositories/speedometer/hardware/speedometer'
# TODO
STATIC_PATH = '/home/szymon/Repositories/speedometer/web/'
INDEX_URL = '/static/index.html'
SLEEP_TIME_ON_ERROR = 0.01
SOCKET_GET_MSG = 'get'


def try_get_speed():
    try:
        return subprocess.check_output(SPEED_PATH).decode()
    except subprocess.CalledProcessError:
        return None


def get_speed():
    while True:
        speed = try_get_speed()
        if speed is not None:
            return speed
        else:
            time.sleep(SLEEP_TIME_ON_ERROR)


class DataWebSocket(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        if(message == SOCKET_GET_MSG):
            self.write_message(get_speed())

    def on_close(self):
        print("WebSocket closed")


def make_app():
    return tornado.web.Application([
        (r'/', tornado.web.RedirectHandler, {'url': INDEX_URL}),
        (r'/socket', DataWebSocket),
        (r'/static/(.*)', tornado.web.StaticFileHandler,
         {'path': STATIC_PATH}),
    ])


if __name__ == '__main__':
    app = make_app()
    app.listen(PORT)
    tornado.ioloop.IOLoop.current().start()
