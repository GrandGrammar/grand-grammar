from app import app
from flask import Flask, request

debug = False

@app.route('/')
def root():
    return app.send_static_file('index.html')
