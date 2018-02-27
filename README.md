# CMPS 480 Senior Project

This website would not have been possible without the efforts of Celina DiPietro, James Winyard, and Sergio Flores, who developed it for their CMPS 480 Senior Project course.

It is currently maintained by Mark Voortman. Please send an email to mvoortman@pointpark.edu for issues, suggestions, or feedback.

## Contribute
The first step is to fork this repository by clicking the `Fork` button at the top of [this page](https://github.com/markvoortman/pioneerpantry) on the right. This will allow you to make changes and eventually you can create pull requests from your forked repository back into this one. After forking, make sure you have a projects directory under your home directory in your jail:
```
mkdir -p ~/projects
```
And change into this directory:
```
cd ~/projects
```
Then simply clone the forked repository:
```
git clone git@github.com:$USERNAME/pioneerpantry.git
```
Make sure to replace $USERNAME with your own GitHub username, since that is where the forked repository should live.

You will need development credentials to run the code. Please email [mvoortman@pointpark.edu](mailto:mvoortman@pointpark.edu) to obtain them. Once received, simply put the `credentials.js` file in the main directory and run:
```
node server.js
```
Note that not all functionality may work. If `node` is not installed, please follow [this tutorial](https://it.pointpark.edu/tutorials/node/).

If you make some changes and would like to contribute them back, please create a pull request to the original repository. Thank you in advance!
