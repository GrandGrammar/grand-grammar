import json
import unirest
import os

from app import app
from flask import Flask, request
from app.settings import APP_ROOT

debug = False

# Routers
@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/checker')
def checker():
    return app.send_static_file('checker.html')

# APIs
def call_twinword_api(url, params):
    f = open(os.path.join(APP_ROOT, 'api_key'), 'r')
    api_key = f.readline()[:-1]

    response = unirest.post(
        url,
        headers={
            'X-Mashape-Key': api_key,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        params=params
    )

    return response

@app.route('/api/check_grammar')
def check_grammar():
    # TODO: Implement this api
    text = request.args['text']
    results = [{
        'from': 17,
        'to': 19,
        'suggestion': 'is'
    }, {
        'from': 21,
        'to': 53,
        'suggestion': 'a scientific and practical approach'
    }, {
        'from': 186,
        'to': 193,
        'suggestion': 'methodical'
    }, {
        'from': 390,
        'to': 400,
        'suggestion': 'transcribed'
    }, {
        'from': 472,
        'to': 484,
        'suggestion': 'most succinct'
    }]
    return json.dumps(results)

@app.route('/api/get_topics')
def get_topics():
    text = request.args['text']
    response = call_twinword_api(
        'https://twinword-topic-tagging.p.mashape.com/generate/',
        { 'text': text }
    )
    return json.dumps(response.body['topic'])

@app.route('/api/get_synonyms')
def get_synonyms():
    word = request.args['word']
    response = call_twinword_api(
        'https://twinword-word-associations-v1.p.mashape.com/associations/',
        { 'entry': word }
    )
    return json.dumps(response.body['associations_array'])

@app.route('/api/get_definition')
def get_definition():
    word = request.args['word']
    response = call_twinword_api(
        'https://twinword-word-graph-dictionary.p.mashape.com/definition/',
        { 'entry': word }
    )
    return json.dumps(response.body)
