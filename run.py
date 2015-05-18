from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado import autoreload
from app import app
import sys

http_server = HTTPServer(WSGIContainer(app))
http_server.listen(int(sys.argv[1]))
ioloop = IOLoop.instance()
#autoreload.start(ioloop)
ioloop.start()
