var inquirer = require('inquirer');
var exec = require('child_process').exec;

inquirer.prompt([
  {
    type: 'list',
    name: 'quote',
    message: 'What quote overlay would you like?',
    choices: [{
      name: 'Epic.',
      value: 'epic.png'
    }, {
      name: 'I struck gold!',
      value: 'Gold.png'
    }, {
      name: 'Howdy world',
      value: 'Howdy.png'
    }, {
      name: 'Pillar playin\'',
      value: 'PillarPlayin.png'
    }, {
      name: 'Wanted',
      value: 'Wanted.png'
    }, {
      name: 'X marks the spot',
      value: 'x.png'
    }, {
      name: 'Dude, where\'s my boat?',
      value: 'DudeBoat.png'
    }, {
      name: 'Very amused!',
      value: 'VeryAmused.png'
    }, {
      name: 'Enjoying the ride!',
      value: 'EnjoyingTheRide.png'
    }]
  }, {
    type: 'list',
    name: 'sepia',
    message: 'What filter would you like?',
    choices: [{
      name: 'Modern',
      value: 'modern'
    }, {
      name: 'Sepia',
      value: 'sepia'
    }]
  }, {
    type: 'input',
    name: 'photo',
    message: 'What is your ticket number?'
  }, {
    type: 'input',
    name: 'twitter',
    message: 'What is your twitter handle?',
    filter: function (answer) {
      if (answer.startsWith('@')) { return answer; }

      return '@' + answer;
    }
  }])
  .then((answers) => {
    setTimeout(function () {
      const Spinner = require('cli-spinner').Spinner;
      const spinner = new Spinner('%s Making you beautiful');
      spinner.setSpinnerString(18);
      spinner.start();

      setTimeout(function () {
        spinner.stop();
        exec(`cd python; python2 image_manip.py ${answers.quote} dry_run ${answers.twitter} ../TechTrek2016/${answers.photo}.jpg ${answers.sepia} white &`);
      }, 3000);
    }, 6000);

    setTimeout(function () {
      const Spinner = require('cli-spinner').Spinner;
      const spinner = new Spinner('%s Creating your image');
      spinner.setSpinnerString(18);
      spinner.start();

      setTimeout(function () {
        spinner.stop();
        loop(0);
      }, 3000);
    }, 0)
  });



function loop(line) {
  if (lines[line]) {
    console.log(lines[line]);
    setTimeout(function() {
      loop(line + 1);
    }, 20);
  }
}

const program = `from PIL import Image, ImageFilter, ImageOps
from TwitterAPI import TwitterAPI
import argparse
import sys
def make_linear_ramp(white):
    # putpalette expects [r,g,b,r,g,b,...]
    ramp = []
    r, g, b = white
    for i in range(255):
        ramp.extend((r*i/255, g*i/255, b*i/255))
    return ramp
def sepia_filter(im):
    # make sepia ramp (tweak color as necessary)
    sepia = make_linear_ramp((255, 200, 140))
    # convert to grayscale
    if im.mode != "L":
        im = im.convert("L")
    im = ImageOps.autocontrast(im)
    # apply sepia palette
    im.putpalette(sepia)
    im = im.convert("RGBA")
    return im
def set_alpha_transparencies(image, image_pixel_transparency, desired_color):
    datas = image.getdata()
    newData = []
    for item in datas:
        if item[0] > 250 and item[1] > 250 and item[2] > 250:
            newData.append((255, 255, 255, 0))
        else:
            if desired_color == None:
                newData.append((item[0], item[1], item[2], image_pixel_transparency))
            else:
                color = get_rgb(desired_color)
                newData.append((color[0], color[1], color[2], image_pixel_transparency))
    image.putdata(newData)
def get_rgb(color):
    return {
        "blue":[0,0,255],
        "green":[0,255,0],
        "red":[255,0,0],
        "white":[255,255,255],
        "black":[0,0,0],
        "yellow":[255,255,0],
        "purple":[127,0,255],
        "orange":[255,128,0]
    }.get(color,[0,255,0])
def get_quote_image(choice):
    return {
        1:"Epic.png",
        2:"Gold.png",
        3:"Howdy.png",
        4:"PillarPlayin.png",
        5:"Wanted.png",
        6:"x.png",
        7:"Badges.png"
    }.get(choice,"Epic.png")
def main():
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('quote_choice', metavar='quote_choice', type=int, nargs=1,
                        help='choice of quote to overlay')
    parser.add_argument('dry_run', metavar='dry_run', type=str, nargs=1,
                        help='dryrun will post to display image and not post to Twitter')
    parser.add_argument('twitter_handle', metavar='twitter_handle', type=str, nargs=1,
                        help='twitter handle to tag yourself!')
    parser.add_argument('photo_path', metavar='photo_path', type=str, nargs=1,
                        help='path to the photo!')
    parser.add_argument('sepia', metavar='sepia', type=str, nargs=1,
                        help='modern or sepia')
    parser.add_argument('text_color', metavar='text_color', type=str, nargs=1,
                        help='color of text overlay')
    args = parser.parse_args()
    try:
        background = Image.open(args.photo_path[0])
        pillar_overlay = Image.open("ForgeLogo.png")
        choice = get_quote_image(args.quote_choice[0])
        quote = Image.open(choice)
        quote = quote.convert("RGBA")
        background = background.convert("RGBA")
        pillar_overlay = pillar_overlay.convert("RGBA")
        blurred_overlay = pillar_overlay.filter(ImageFilter.SHARPEN)
        test_image = Image.new("RGBA",background.size,-1)
        quote_overlay = Image.new("RGBA",background.size,-1)
        test_image.paste(blurred_overlay, (25, test_image.height-175), mask=blurred_overlay)
        horiz_placement = test_image.width/2 - quote.width/2
        blurred = quote.filter(ImageFilter.SMOOTH)
        quote_overlay.paste(blurred,(horiz_placement, 50), mask=quote)
        #make all white pixels transparent
        set_alpha_transparencies(test_image, 100, "white")
        if args.sepia[0] in "sepia":
            quote_color = "white"
        else:
            quote_color = args.text_color[0]
        set_alpha_transparencies(quote_overlay, 175, quote_color)
        new_image = Image.alpha_composite(background,test_image)
        new_image = Image.alpha_composite(new_image,quote_overlay)
        if args.sepia[0] in "sepia":
            final_image = sepia_filter(new_image)
        else:
            final_image = new_image
        final_image.save("new.png", "PNG")
        if args.dry_run[0] not in "dryrun":
            CONSUMER_KEY = 'bBgH2OU6xfY3TP0dtSsFlW8Ar'
            CONSUMER_SECRET = 'aj7BM1Q2x3Dxuuq1Esi33T0lCMx58snxgR4LVt7TQ3luOVUiAC'
            ACCESS_TOKEN_KEY = '741065004905070592-I4gwZGDPGuGQs5kxkB35ojjnYR5mlm5'
            ACCESS_TOKEN_SECRET = 'hy3A8vmgS5DATxK9Y5QlT7vDlMP5F7dPhqvXU84RublGz'
            api = TwitterAPI(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)
            file = open('new.png', 'rb')
            data = file.read()
            r = api.request('statuses/update_with_media',
                            {'status': 'Hello World from The Forge by Pillar (@agilesoftware) during #A2TechTrek 2016- '+args.twitter_handle[0]},
                            {'media[]': data})
            print(r.status_code)
        else:
            final_image.show()
    except:
        e = sys.exc_info()[0]
        print "Error: %s" % e
if __name__ == '__main__': main()`

const lines = program.split('\n');
