import os

# assign directory
clips_directory = 'static/assets/videos/clips'

fulltask_directory = 'static/assets/videos/full_tasks'

# Loop through the clips directory and create a starter environment for each video there

with open('clip_info.env', "w") as fhandle:
    for root, dirs, files in os.walk(clips_directory):
        for filename in files:
            print(os.path.join(root, filename))
            image = filename[:-3] + 'png'
            basic_str = filename + '=\'clip name^^' + image + '^^' + filename + '^^description^^info\'\n'
            fhandle.write(basic_str)

fhandle.close()

with open('fulltask.env', "w") as fhandle:
    for root, dirs, files in os.walk(fulltask_directory):
        for filename in files:
            print(os.path.join(root, filename))
            image = filename[:-3] + 'png'
            basic_str = filename + '=\'task name^^' + filename + '^^' + image + '^^Contestants^^Description^^note_1,note_2\'\n'
            fhandle.write(basic_str)

fhandle.close()