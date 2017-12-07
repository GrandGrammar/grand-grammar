import numpy as np
import json
import os

from app.settings import APP_ROOT

class ViterbiAlgorithmUNK(object):
    def __init__(self):
        self.tag_transition_prob = np.zeros((10, 10))
        self.tag_index = ["RB", "NN", "CC", "VBN", "JJ", "IN", "VBZ", "DT", "NNS", "NNP"]

        with open(os.path.join(APP_ROOT, 'algorithms', 'parameters.json'), 'r') as f:
            parameters = json.load(f)
            self.tag_cooccur = parameters[0]
            self.tag_word = parameters[2]
            self.start_tag_prob = parameters[1]
            self.vocabulary = parameters[3]

        for pos1, _ in self.tag_cooccur.items():
            r = self.tag_index.index(pos1)
            for pos2, prob in self.tag_cooccur[pos1].items():
                c = self.tag_index.index(pos2)
                self.tag_transition_prob[r][c] = prob

    def viterbi(self, words):

        dynamic_viterbi = np.zeros((10, 10))                  # VP matrix for probabilities
        state_sequence = np.zeros((len(words) - 1, 10))       # state sequence transition matrix
        max_prob = np.zeros((1, 10))                          # store max probability

        # Replace unseen words as "unk"
        for i in range(len(words)):
            if words[i] not in self.vocabulary:
                words[i] = "unk"

        # Initialization
        for i in range(10):
            if words[0] in self.tag_word[self.tag_index[i]].keys():
                vp = self.start_tag_prob[self.tag_index[i]] * self.tag_word[self.tag_index[i]][words[0]]
            else:
                vp = 0
            dynamic_viterbi[i].fill(vp)

        # Iteration
        for t in range(1, len(words)):

            # Compute output probability array
            output_prob = np.zeros(10)
            for p in range(10):
                if words[t] in self.tag_word[self.tag_index[p]].keys():
                    output_prob[p] = self.tag_word[self.tag_index[p]][words[t]]
                else:
                    output_prob[p] = 0

            # Compute VP matrix
            dynamic_viterbi = dynamic_viterbi * self.tag_transition_prob * output_prob

            # Update state sequence transition matrix with best path for each state at t
            state_sequence[t - 1] = np.argmax(dynamic_viterbi, axis = 0)

            # Update VP matrix for next iteration
            max_prob = np.max(dynamic_viterbi, axis = 0)
            for p in range(10):
                dynamic_viterbi[p].fill(max_prob[p])

        # Find the optimal path
        optimal_path = np.zeros(len(words))
        optimal_path[len(words) - 1] = np.argmax(max_prob)
        for t in range(len(words) - 2, -1, -1):
            optimal_path[t] = state_sequence[t][int(optimal_path[t + 1])]
        rst = []
        for state in optimal_path:
            rst.append(self.tag_index[int(state)])

        return rst


    def pos_tag(self, words, k):

        tags = self.viterbi(words)
        return tags[k]
