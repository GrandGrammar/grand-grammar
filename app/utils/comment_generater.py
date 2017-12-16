import random

SINGLE_ERROR_TEMPLATES = [
    ['It will be better if you pay more attention to ', 's and use them in the right way.'],
    ['It seems you made some ', ' errors, check those mistakes and make sure you understand them.'],
    ['Opps, you might want to improve the way you use ', 's.'],
    ['Be careful with ', 's in the future.'],
    ['You might need to focus more on usage of ', 's.'],
    ['Pay more attention to ', 's.'],
    ['Try to avoid ', ' errors in your future writing, and more advanced vocabulary can be used.'],
    ['Hey, be careful! You have made ', ' errors. Double check and try to find it yourself next time.']
]
MULTI_ERROR_TEMPLATES = [
    ['It seems you made some ', ' and ', ' errors, check those mistakes and make sure you understand them.'],
    ['Opps, you might want to improve the way you use ', 's and ', 's.'],
    ['Be careful with ', 's and ', 's in the future.'],
    ['You might need to focus more on usage of ', 's and ', 's.'],
    ['Pay more attention to ', 's and ', 's.'],
    ['Try to avoid ', ' and ', ' errors in your future writing, and more advanced vocabulary can be used.'],
    ['Hey, be careful! You have made ', ' and ', ' errors. Double check and try to find it yourself next time.']
]
NO_ERROR_TEMPLATES = [
    'Excellent! No mistake detected.',
    'Try to use the new words you learned next time!',
    'Great job! Believe in yourself and you are sure to be a English master after hard work!',
    'Nice job so far, have you learned any new words today? Try to use them next time!'
]

def combine_errors(error_type):
    out = { 'noun': 0, 'verb': 0, 'adjective': 0, 'adverb': 0 }
    for type_name in ['NN', 'NNS', 'NNP', 'NNPS']:
        if type_name in error_type:
            out['noun'] += error_type[type_name]
    for type_name in ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ']:
        if type_name in error_type:
            out['verb'] += error_type[type_name]
    for type_name in ['JJ', 'JJR', 'JJS']:
        if type_name in error_type:
            out['adjective'] += error_type[type_name]
    for type_name in ['RB', 'RBR', 'RBS']:
        if type_name in error_type:
            out['adverb'] += error_type[type_name]
    return out

def generate_comment(error_type):
    error_names = []
    for error, count in sorted(error_type.iteritems(), key=lambda (k,v): (v,k), reverse=True):
        if count > 0:
            error_names.append(error)

    if len(error_names) == 0:
        index = random.randint(0, len(NO_ERROR_TEMPLATES) - 1)
        return NO_ERROR_TEMPLATES[index]
    elif len(error_names) == 1:
        index = random.randint(0, len(SINGLE_ERROR_TEMPLATES) - 1)
        return SINGLE_ERROR_TEMPLATES[index][0] + error_names[0] + SINGLE_ERROR_TEMPLATES[index][1]
    else:
        index = random.randint(0, len(MULTI_ERROR_TEMPLATES) - 1)
        return MULTI_ERROR_TEMPLATES[index][0] + error_names[0] + MULTI_ERROR_TEMPLATES[index][1] + error_names[1] + MULTI_ERROR_TEMPLATES[index][2]
