from flask import Flask, render_template, request, jsonify
import openai
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename
import magic
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

app = Flask(__name__)

load_dotenv('.env') #load to process environment
api_key = os.getenv('OPENAI_API_KEY')
openai.api_key = api_key

def api_response(terms):

    messages = [
        {'role': 'system', 'content': 'You are an experienced lawyer specializing in terms and conditions review.'},
        {'role': 'user', 'content': f'As an expert in the field, I need your professional assistance. Please provide a concise summary of the key points and implications of the terms and conditions document that i have pasted here: \n\n {terms}.'},
    ]

    response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=messages,
            max_tokens=700,
        )
    
    return response

ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

def validate_file_type(file):
    file_mime_type = magic.from_buffer(file.read(), mime=True)
    file.seek(0)
    if file_mime_type not in ALLOWED_MIME_TYPES:
        return False
    return True

def perform_ocr(image):
    img = Image.open(image)
    text = pytesseract.image_to_string(img)
    return text

@app.route('/home')
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    terms = request.json['terms']
    
    print(terms)

    response = api_response(terms)

    print(response)
    summary = response.choices[0]["message"]["content"].strip()

    print(summary)

    return jsonify({'summary': summary})

@app.route('/upload-file', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':

        if 'file' not in request.files:
            return 'No file uploaded'
        
        print(request.files)
        
        file = request.files['file']

        print(type(file))
        print(file)
        
        if file.filename == '':
            return 'No file selected'
        
        if not validate_file_type(file):
            return 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
        
        filename = secure_filename('terms')

        file_extension = file.filename.rsplit('.', 1)[1].lower()

        filename_with_extension = f"{filename}.{file_extension}"

        file_path = 'temp/' + filename_with_extension
        file.save(file_path)

        ocr_text=''

        if file_extension == 'pdf':
            images = convert_from_path(file_path)
            ocr_text = ''
            for i, image in enumerate(images):
                image_path = f'temp/page_{i}.jpg'
                image.save(image_path)
                ocr_text += perform_ocr(image_path)
                os.remove(image_path)  # Remove temporary image file
            os.remove(file_path)  # Remove uploaded PDF file
        elif file_extension in ['jpg', 'jpeg', 'png']:
            ocr_text = perform_ocr(file_path)
            os.remove(file_path)  # Remove uploaded image file
        
        print(ocr_text)
        
        response = api_response(ocr_text)

        print(response)
        summary = response.choices[0]["message"]["content"].strip()

        print(summary)
        summary = summary.replace('\n', '<br>')

        return jsonify({'summary': summary})
    
@app.route('/contactus')
def contactus():
    return render_template('contactus.html') #contactus.html

@app.route('/privacypolicy')
def privacypolicy():
    return render_template('privacypolicy.html') #privacypolicy.html

@app.route('/termsofservice')
def termsofservice():
    return render_template('termsofservice.html') #termsofservice.html

if __name__ == "__main__":
    app.run(debug=True)