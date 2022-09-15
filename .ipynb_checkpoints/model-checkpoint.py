
from torchvision.transforms import GaussianBlur
from torch import nn
from torchvision.transforms import ToTensor
from torchvision.transforms.functional import to_pil_image

class Pipeline(nn.Module):
    
    def __init__(self, in_channels, out_channels, kernel_size = 5, out_size = 512):
        super().__init__()
        self.out_size = out_size
        self.blur = GaussianBlur(kernel_size, sigma=1)
        self.convert_tensor = ToTensor()
    
    def forward(self, img):
        '''
        parameter:
            img: PIL Image
        return:
            PIL Image
        
        '''
        img = self.convert_tensor(img).unsqueeze(0)*2-1
        img = self.blur(img)
        img = nn.functional.interpolate(img, size=(self.out_size,self.out_size))
        
        return to_pil_image(img.add(1).div(2).clamp(0, 1)[0].cpu())