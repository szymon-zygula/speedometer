import tornado.ioloop
import tornado.web

PORT = 8888


class DataWebSocket(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        self.write_message(u"You said: " + message)

    def on_close(self):
        print("WebSocket closed")


class StaticHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('index.html !!!')


def make_app():
    return tornado.web.Application([
        (r'/', StaticHandler)
    ])


if __name__ == '__main__':
    app = make_app()
    app.listen(PORT)
    tornado.ioloop.IOLoop.current().start()
