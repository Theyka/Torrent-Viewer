from quart import Quart, render_template, send_from_directory
import os

app = Quart(__name__)

app.config['STATIC_FOLDER'] = 'static'
app.config['TEMPLATES_FOLDER'] = 'templates'

@app.route('/')
async def index():
    return await render_template('index.html')


# Serve the static files (CSS, JS, etc.)
@app.route('/static/<path:path>')
async def static_files(path):
    return await send_from_directory(os.path.join(app.root_path, 'static'), path)

if __name__ == '__main__':
    app.run(debug=True)
