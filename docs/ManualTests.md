* After maps were created, play testing had to be done manually.
* Added ability to hold down 'a' to autoplay the game
* A file was created to automatically run through levels without having to physically hold down the 'a' button
* When items were added, this caused problems with the 'a' button, because the items acted like a block for the path
* This was fixed when the item properties were changed so if you walked over them, they could be picked up.
* When monster wandering pathfinding was added, monster could get in your way if 'a' is held down.
* This causes a fight to happen and HP gets lowered, which may end the autoplay.
* When aggressive monster pathfinding was added, this guaranteed that monsters would get in your way, augmenting the issues above.
