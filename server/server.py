import tornado.ioloop
import tornado.web

PORT = 8888


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('Hello')


def make_app():
    return tornado.web.Application([
        (r'/', MainHandler)
    ])


if __name__ == '__main__':
    app = make_app()
    app.listen(PORT)
    tornado.ioloop.IOLoop.current().start()
