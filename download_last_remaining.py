#!/usr/bin/env python3
"""
Script to download last remaining Hana Bank PDF forms from page 33
"""

import os
import requests
import time
import re
import json

def clean_filename(filename):
    """Clean filename for safe file system usage"""
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    filename = re.sub(r'\s+', '_', filename)
    filename = filename.strip('._')
    return filename[:200]

def download_pdf(url, filename, download_dir):
    """Download a PDF file"""
    try:
        print(f"Downloading: {filename}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        if 'application/pdf' in response.headers.get('content-type', ''):
            filepath = os.path.join(download_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"✓ Downloaded: {filename}")
            return True
        else:
            print(f"✗ Not a PDF: {filename}")
            return False
    except Exception as e:
        print(f"✗ Error downloading {filename}: {e}")
        return False

def main():
    download_dir = "hana_bank_forms"
    os.makedirs(download_dir, exist_ok=True)
    
    # Last remaining PDF URLs from page 33
    last_remaining_pdf_urls = [
                # From page 1
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2025/08/21/5-09-0101.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2025/08/20/3-08-1294.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2025/07/24/daegu_250721.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070108/__icsFiles/afieldfile/2025/07/18/5-20-0026.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070108/__icsFiles/afieldfile/2025/07/18/5-20-0025.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070108/__icsFiles/afieldfile/2025/07/18/5-14-0020.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2025/06/30/5-06-0681.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2025/06/23/5-06-0920.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2025/06/23/5-06-0919.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2025/06/23/5-16-0177.pdf",
               # Page 2 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2025/06/23/5-16-0139.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2025/06/20/3-09-0131_250620.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070108/__icsFiles/afieldfile/2025/05/30/5-14-0036_20250530.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2025/05/23/20250526_01.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2025/05/16/5-08-0752.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2025/05/16/5-08-0501.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2025/05/16/5-99-0086.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2025/05/16/5-08-0484.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2025/05/16/5-08-0498.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2025/05/16/5-08-0491.pdf",
                # Page 16 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/10/21/5_29_0206_2.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2022/07/26/5-08-0553_20220728_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0568_220629.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/05/17/20220517_ab1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/05/17/20220517_ab2.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2022/04/14/5-08-0591.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2022/04/06/5-09-0465_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2022/04/06/5-09-0463_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2022/02/09/3-08-0029.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/01/24/5-09-0212.pdf",
        
        # Page 17 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/01/24/5-09-0363.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/01/25/5-09-0215.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/01/24/5-09-0210.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/01/24/5-09-0206.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/01/20/5-09-0505.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2022/01/20/5-09-0504.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2022/02/21/5-08-0344.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2022/02/21/5-08-0230.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/12/22/5-09-0049_211222.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0733_211203.pdf",
        
        # Page 18 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2021/11/30/5-09-0511.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/12/03/5-16-0325.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/12/03/5-16-0313.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/12/03/5-06-0913.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2021/11/22/stockholder_211122.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/11/16/5-06-0710.xls",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/11/16/5-06-0711.xls",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2021/11/08/5-09-0510.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2021/11/08/5-09-0099_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/09/29/5060981_20210924.pdf",
        
        # Page 19 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2021/09/24/5-99-0039_210924.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2021/09/24/5-99-0040_210924.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/09/24/5-06-0147_210924.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0429_210924.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0428_210924.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0427_210924.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2022/07/29/5-99-0020.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2022/07/29/5-08-0552.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0978_210917.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0898_210917.pdf",
                # Page 21 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0615.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0614.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0613.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0612.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0195.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0565_210917.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0269_210917.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0687_210917.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0653.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0652.pdf",
        
        # Page 22 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0196.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0259_210917.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0292.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0426.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0581.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0261_210917.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2022/07/29/5-06-0550_210917.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2021/09/07/5-08-0016_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/08/31/b000005060519_20181010.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/08/31/Loan_form02.pdf",
        
        # Page 23 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2021/09/03/3-08-1282_210903.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070107/__icsFiles/afieldfile/2021/08/26/5210001_20210706.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070107/__icsFiles/afieldfile/2021/08/26/5210001_20210115.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070109/__icsFiles/afieldfile/2021/08/19/3-14-0231_20210819.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2021/08/18/5-09-0464.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/07/20/5-09-0173_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/07/20/5-09-0486_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/07/20/5-09-0486_2.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/08/13/5_09_0206_7.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2025/03/07/5-09-0433.pdf",
                # Page 24 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/07/20/5_09_0206_4_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2021/12/03/3-08-0024_210525.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2021/12/03/3-08-0025_210525.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2021/04/19/5-09-0492_210419.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070105/__icsFiles/afieldfile/2021/04/19/5-09-0489_210419.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070107/__icsFiles/afieldfile/2021/05/27/3-21-0004_20210510.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/03/12/5-09-0163.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2021/03/12/5-09-0162.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/03/11/5-16-0156_20210311.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2021/03/11/5-08-0440_20210311.pdf",
        
        # Page 25 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/03/02/5-16-0112_20210302.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/03/02/5-06-0813_20210302.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/03/02/5-06-0857_20210302_2.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/03/02/5-16-0136_20210302_2.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/03/02/5-06-0820_20210302_2.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/03/02/5-16-0179_20210302.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/02/23/pdf_sw_20210223.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/02/23/pdf_sw_20210223_01.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/02/08/5-16-0259_210205.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/02/08/5-16-0241_210205.pdf",
            # Page 28 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0373.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0371.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0370.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0362.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0372.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0281_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0291.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/08/12/5-09-0185.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2021/01/08/5-08-0502_210108.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2020/08/07/5-08-0418_20200807.pdf",
        
        # Page 29 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2020/08/07/5-08-0397_20200807.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2020/08/07/5-08-0257_20200807.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2020/08/07/5-08-0256_20200807.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2021/01/08/5-08-0483_210108.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2020/07/10/5-06-0943.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/07/01/5-08-0506_20200702.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2020/07/02/5-06-0896.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2020/06/12/5_08_0135.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2020/06/12/5_08_0134.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/29/5_08_0041_20200601.pdf",
            # Page 31 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/3-08-1297_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0177_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0099_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0067_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0030_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0038_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0042_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0029_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0043_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0013_200508.pdf",
        
        # Page 32 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0026_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0001_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0027_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0155_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0037_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2020/05/08/5-08-0035_200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2020/05/08/5-08-0320-200508.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070108/__icsFiles/afieldfile/2020/04/09/5-14-0111_200331.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2020/03/26/5-09-0164_1.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2020/01/13/5-06-0876.pdf",
        # Page 33 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2017/10/20/pdf_sw_20171020_03.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2021/04/19/5-06-0738_20170922.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2018/01/10/5-09-0198_170807.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070106/__icsFiles/afieldfile/2018/12/21/5080258.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2017/04/28/3-09-0240.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070103/__icsFiles/afieldfile/2017/11/22/5-09-0328_171122.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2017/03/17/5060330_20170317.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2017/03/14/20170314_08.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2016/12/30/5-08-0075.pdf",
        # Page 34 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/20/5-06-0135.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5-06-0741_20150901.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5060703_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/document4_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/document3_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/document2_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/document1_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/20160707_a1.pdf",
                # Page 35 URLs
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/20160707_a2.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/20160707_a3.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/20160707_a6.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/20160707_a7.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5060189_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5060015_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5060381_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5060451_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5060457_20160707.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/3090174_20160707.pdf",
                # From page 43
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2014/08/07/cccc005080209_20140807.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070101/__icsFiles/afieldfile/2013/08/19/20130819.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070104/__icsFiles/afieldfile/2021/07/01/b000020130313_20090921.pdf",
        "https://image.kebhana.com/cont/customer/customer07/customer0701/customer070102/__icsFiles/afieldfile/2016/07/07/5090002_20160707.pdf",
    ]
    
    print(f"Starting download of last remaining Hana Bank forms...")
    print(f"Total PDFs to download: {len(last_remaining_pdf_urls)}")
    print(f"Download directory: {download_dir}")
    
    successful_downloads = 0
    failed_downloads = 0
    
    for i, pdf_url in enumerate(last_remaining_pdf_urls, 1):
        filename = os.path.basename(pdf_url)
        
        filepath = os.path.join(download_dir, filename)
        if os.path.exists(filepath):
            print(f"⏭️  Skipping (already exists): {filename}")
            successful_downloads += 1
            continue
        
        if download_pdf(pdf_url, filename, download_dir):
            successful_downloads += 1
        else:
            failed_downloads += 1
        
        if i % 10 == 0:
            print(f"Progress: {i}/{len(last_remaining_pdf_urls)} ({i/len(last_remaining_pdf_urls)*100:.1f}%)")
        
        time.sleep(0.5)
    
    print(f"\nDownload complete!")
    print(f"Successfully downloaded: {successful_downloads}/{len(last_remaining_pdf_urls)} PDFs")
    print(f"Failed downloads: {failed_downloads}")
    print(f"Files saved to: {download_dir}/")

if __name__ == "__main__":
    main()
