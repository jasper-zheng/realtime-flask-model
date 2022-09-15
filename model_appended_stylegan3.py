
# from torchvision.transforms import GaussianBlur
from torchvision.transforms import ToTensor
from torchvision.transforms.functional import to_pil_image


import legacy
import dnnlib

import torch
import numpy as np


    

    
class Pipeline(torch.nn.Module):
    
    def __init__(self, out_size = 512):
        super().__init__()
        self.out_size = out_size
        self.convert_tensor = ToTensor()
        
        device = torch.device('cuda')
        self.device = device
        network_pkl = '/notebooks/training-runs/00014-stylegan3-r-ffhq-256x256-gpus1-batch96-gamma2/network-snapshot-000064.pkl'

        with dnnlib.util.open_url(network_pkl) as f:
            self.g_model = legacy.load_network_pkl(f)['G_ema'].eval().requires_grad_(False).to(device)
            
        self.w_avg = self.g_model.mapping.w_avg.unsqueeze(0).unsqueeze(1).repeat(1, self.g_model.mapping.num_ws, 1).to(device)
        self.z = torch.from_numpy(np.random.randn(1, 512)).to(device)
    
    def forward(self, img):
        '''
        parameter:
            img: PIL Image
        return:
            PIL Image
        
        '''
        img = self.convert_tensor(img).to(self.device).unsqueeze(0)*2-1
        
        img = self.g_model(self.z, None, img)
        
        img = torch.nn.functional.interpolate(img, size=(self.out_size,self.out_size))
        
        return to_pil_image(img.add(1).div(2).clamp(0, 1)[0].cpu())