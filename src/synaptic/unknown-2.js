(function() {
var F = Float64Array ? new Float64Array(36) : [];
 F[0] = 0;
 F[1] = 0;
 F[2] = 0;
 F[3] = 0;
 F[4] = 0;
 F[5] = 0;
 F[6] = 0.07179529594860279;
 F[7] = 0.08072012609481916;
 F[8] = 0.0930201411822682;
 F[9] = 0;
 F[10] = 0;
 F[11] = 0;
 F[12] = 0;
 F[13] = 0;
 F[14] = 0;
 F[15] = -0.013809805558655783;
 F[16] = 0;
 F[17] = 0;
 F[18] = 0;
 F[19] = 0;
 F[20] = -0.09743476134788583;
 F[21] = -0.02859588085728114;
 F[22] = 0.028631378028540377;
 F[23] = 0;
 F[24] = 0;
 F[25] = 0;
 F[26] = 0;
 F[27] = -0.05388232271561382;
 F[28] = 0;
 F[29] = 0;
 F[30] = 0;
 F[31] = -0.006182534925043018;
 F[32] = 0;
 F[33] = 0;
 F[34] = 0;
 F[35] = 0;
 var activate = function(input){
F[1] = input[0];
 F[2] = input[1];
 F[4] = F[5];
 F[5] = F[6];
 F[5] += F[1] * F[7];
 F[5] += F[2] * F[8];
 F[10] = Math.exp(F[5]);
 F[11] = 1 / F[10];
 F[3] = (F[10] - F[11]) / (F[10] + F[11]);
 F[9] = 1 - (F[3] * F[3]);
F[12] = F[1];
 F[13] = F[2];
F[18] = F[19];
 F[19] = F[20];
 F[19] += F[1] * F[21];
 F[19] += F[2] * F[22];
 F[10] = Math.exp(F[19]);
 F[11] = 1 / F[10];
 F[17] = (F[10] - F[11]) / (F[10] + F[11]);
 F[23] = 1 - (F[17] * F[17]);
F[24] = F[1];
 F[25] = F[2];
F[29] = F[30];
 F[30] = F[31];
 F[30] += F[3] * F[15];
 F[30] += F[17] * F[27];
 F[10] = Math.exp(F[30]);
 F[11] = 1 / F[10];
 F[28] = (F[10] - F[11]) / (F[10] + F[11]);
 F[32] = 1 - (F[28] * F[28]);
F[33] = F[3];
 F[34] = F[17];
 var output = [];
 output[0] = F[28];
 return output;
 };
 var propagate = function(rate, target){
F[0] = rate;
 F[35] = target[0];
 F[16] = F[35] - F[28];
 F[15] += F[0] * (F[16] * F[33]);
 F[27] += F[0] * (F[16] * F[34]);
 F[31] += F[0] * F[16];
 F[26] = 0;
 F[26] += F[16] * F[27];
 F[26] *= F[23];
 F[21] += F[0] * (F[26] * F[24]);
 F[22] += F[0] * (F[26] * F[25]);
 F[20] += F[0] * F[26];
 F[14] = 0;
 F[14] += F[16] * F[15];
 F[14] *= F[9];
 F[7] += F[0] * (F[14] * F[12]);
 F[8] += F[0] * (F[14] * F[13]);
 F[6] += F[0] * F[14];
  };

var ownership = function(memoryBuffer){
F = memoryBuffer;

this.memory = F;

};

return {
memory: F,
activate: activate,
propagate: propagate,
ownership: ownership
};

})
