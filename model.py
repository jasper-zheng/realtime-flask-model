
from torchvision.transforms import GaussianBlur
from torchvision.transforms import ToTensor
from torchvision.transforms.functional import to_pil_image, affine

import legacy
import dnnlib

import torch
import numpy as np

from utils import base64_to_pil_image, pil_image_to_base64

network_pkl = './saved_models/demo_model.pkl'


# class Pipeline(torch.nn.Module):
#
#     def __init__(self, in_size = 256, out_size = 512):
#         super().__init__()
#         self.out_size = out_size
#         self.convert_tensor = ToTensor()
#         self.in_size = in_size
#
#         device = torch.device('cuda')
#         self.device = device
#
#         with dnnlib.util.open_url(network_pkl) as f:
#             self.g_model = legacy.load_network_pkl(f)['G_ema'].eval().requires_grad_(False).to(device)
#
#         self.w_avg = self.g_model.mapping.w_avg.unsqueeze(0).unsqueeze(1).repeat(1, self.g_model.mapping.num_ws, 1).to(device)
#         self.z = torch.from_numpy(np.random.randn(1, 512)).to(device)
#
#         self.initialise_plugins()
#
#     def initialise_plugins(self):
#       img = torch.zeros((1,3,self.in_size,self.in_size)).to(self.device)
#       _ = self.g_model(self.z, None, img)
#
#
#     def forward(self, img):
#         '''
#         parameter:
#             img: PIL Image
#         return:
#             PIL Image
#
#         '''
#         img = self.convert_tensor(img).to(self.device).unsqueeze(0)*2-1
#
#         img = self.g_model(self.z, None, img)
#
#         img = torch.nn.functional.interpolate(img, size=(self.out_size,self.out_size))
#
#         return to_pil_image(img.add(1).div(2).clamp(0, 1)[0].cpu())
#


class Pipeline(torch.nn.Module):

   def __init__(self, kernel_size = 5, out_size = 256):
       super().__init__()
       self.out_size = out_size
       self.blur = GaussianBlur(kernel_size, sigma=1)
       self.convert_tensor = ToTensor()
       self.configs = {
           "angle": 0,
           "translateX": 0,
           "translateY": 0,
           "scale": 1,
           "shear": 0
       }
       self.g_model = None

   def update_configs(self, c):
       self.configs = c

   def get_cluster_demo(self, idx, layer_name, img):
       img = base64_to_pil_image(img)
       img = self.convert_tensor(img).unsqueeze(0)*2-1
       img = img[:,0].unsqueeze(1)

       img = to_pil_image(img.add(1).div(2).clamp(0, 1)[0].cpu())
       return pil_image_to_base64(img, quality = 75)

   def get_layer_names(self):
       if self.g_model is not None:
           return self.g_model.get_layer_names()
       else:
           return ['L4_52_1024', 'L5_84_724']

   def forward(self, img):
       '''
       parameter:
           img: PIL Image
       return:
           PIL Image

       '''
       img = self.convert_tensor(img).unsqueeze(0)*2-1
       # img = self.blur(img)
       img = affine(img,
                    angle=int(self.configs["angle"]),
                    translate=[int(self.configs["translateX"]), int(self.configs["translateY"])],
                    scale=float(self.configs["scale"]),
                    shear=int(self.configs["shear"]))
       img = torch.nn.functional.interpolate(img, size=(self.out_size,self.out_size))

       return to_pil_image(img.add(1).div(2).clamp(0, 1)[0].cpu())
