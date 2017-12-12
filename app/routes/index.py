import json
import unirest
import os
import urlparse
import urllib

from app import app
from flask import Flask, request
from app.settings import APP_ROOT
from app.algorithms.ViterbiAlgorithmUNK import ViterbiAlgorithmUNK

debug = False

# Routers
@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/checker')
def checker():
    return app.send_static_file('checker.html')

@app.route('/about')
def about():
    return app.send_static_file('about.html')

# APIs
def call_twinword_api(url, params):
    f = open(os.path.join(APP_ROOT, '.api_key'), 'r')
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

def call_ginger_api(text):
    f = open(os.path.join(APP_ROOT, '.ginger_api_key'), 'r')
    api_key = f.readline()[:-1]

    scheme = 'http'
    netloc = 'services.gingersoftware.com'
    path = '/Ginger/correct/json/GingerTheText'
    params = ''
    query = urllib.urlencode([
        ('lang', 'US'),
        ('clientVersion', '2.0'),
        ('apiKey', api_key),
        ('text', text)])
    fragment = ''

    url = urlparse.urlunparse((scheme, netloc, path, params, query, fragment))
    response = urllib.urlopen(url)
    result = json.loads(response.read().decode('utf-8'))
    return result

@app.route('/api/check_grammar')
def check_grammar():
    text = request.args['text']
    response = call_ginger_api(text)
    results = []
    for error in response['LightGingerTheTextResult']:
        if error['Suggestions']:
            results.append({
                'from': error['From'],
                'to': error['To'],
                'suggestion': error['Suggestions'][0]['Text']
            })
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

    if response.body['result_msg'] != 'Success':
        return json.dumps(response.body)

    va = ViterbiAlgorithmUNK()
    init_tag = va.pos_tag([ word, 'test' ], 0)

    filtered_list = []
    for w in response.body['associations_array']:
        if va.pos_tag([ w, 'test' ], 0) == init_tag:
            filtered_list.append(w)

    resp = {
        'result_msg': 'Success',
        'associations_array': filtered_list
    }

    return json.dumps(resp)

@app.route('/api/get_definition')
def get_definition():
    word = request.args['word']
    response = call_twinword_api(
        'https://twinword-word-graph-dictionary.p.mashape.com/definition/',
        { 'entry': word }
    )
    return json.dumps(response.body)

@app.route('/api/get_exam_history')
def get_exam_history():
    word = request.args['word']
    response = call_twinword_api(
        'https://twinword-word-graph-dictionary.p.mashape.com/examhistory/',
        { 'entry': word }
    )
    return json.dumps(response.body)
