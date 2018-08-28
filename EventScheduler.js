// Decides which commands should be running based off of their priorities and required subsystems
function EventScheduler() {
	// Runs an iteration of the EventScheduler
	this.loop = function() {
		// Gets the rawCommandQueue from the CommandFactory constructor
		var commandQueue = CommandFactory.getCommandQueue();
		
		// A queue to hold commands ordered by priority
		//var commandQueue = new Array();
		
		// The number of Subsystems that have been created
		var numSubsystems = Subsystem.getNumSubsystems();
		
		// Holds the current Command being manipulated inside for loops
		var command;
		
		// Function to add commands in order of priority to a queue
		/*function addCommand(queue, command) {
			// Adds default commands as lowest priority
			if (command.isDefault()) {
				queue.unshift(command);
				return;
			}
			
			// If the queue is empty, adds the first command
			if (queue.length === 0) {
				queue.push(command);
				return;
			}
			
			// Loops through the queue to find where to insert the Command based on priorities
			for (var i = 0; i < queue.length; i++) {
				// If the Command to be inserted has the highest priority, it is pushed to the top of the Array
				if (command.getPriority() <= queue[i].getPriority() && !queue[i].isDefault()) { // Otherwise, it is inserted below Commands of the same priority that were added before it (unless they are default Commands)
					queue.splice(i, 0, command); // Inserts the Command
					return;
				}
			}
			
			queue.push(command);
		}*/
		
		// Loops through the raw command queue
		/*for (var i = 0; i < rawCommandQueue.length; i++) {
			// Sets the current Command
			currCommand = rawCommandQueue[i];
			
			// Remove Commands that are finished and run their end functions
			if (currCommand.isFinished()) {
				currCommand.end();
				rawCommandQueue.splice(i, 1);
				i--;
				continue;
			}
			
			// Executes Commands that do not require Subsystems
			if (currCommand.getRequirements().length === 0) {
				if (currCommand.getStatus() === "idle")
					currCommand.initialize();
				currCommand.execute();
			} else { // Add the current Command to the command queue ordered by priority
				addCommand(commandQueue, currCommand);
			}
		}*/
		
		// If there are no Commands that require Subsystems, the loop ends here
		//if (commandQueue.length === 0)
		//	return;
		
		// Get the highest priority command in the commandQueue
		/*currCommand = commandQueue.last();
		
		// Execute the highest priority command
		if (currCommand.getStatus() === "idle")
			currCommand.initialize();
		currCommand.execute();
		
		// An array to keep track of which Subsystems have been claimed by a Command. It is initialized with the highest priority Command's requirements
		var usedSubsystems = currCommand.getRequirements().concat();
		
		// A flag to keep track of whether the current Command being checked can run
		var canRun;
		
		// Loops through the commandQueue and checks which Commands can run
		for (var i = commandQueue.length - 2; i >= 0; i--) {
			// Assume the command canRun
			canRun = true;
			
			// The current Command being evaluated
			currCommand = commandQueue[i];
			
			// An array to keep track of the current Command's requirements
			currCommandReqs = currCommand.getRequirements();
			
			// Make sure all Subsystems are not in use before checking if any more Commands can run
			if (usedSubsystems.length === numSubsystems) {
				canRun = false;
			} else {
				// Loops through the current Command's requirements to check if they are being used by a higher priority Command
				for (var j = 0; j < currCommandReqs.length; j++) {
					// Checks if the subsystem being checked is in use
					if (usedSubsystems.indexOf(currCommandReqs[j]) !== -1) {
						// The current Command cannot run
						canRun = false;
						break;
					}
				}
			}
			
			// If the current Command can run...
			if (canRun) {
				// The current Command is executed
				if (currCommand.getStatus() === "idle")
					currCommand.initialize();
				currCommand.execute();
				
				// Its requirements are added to the Array of Subsystems in use
				usedSubsystems = usedSubsystems.concat(currCommandReqs);
			} else {
				// If the current Command is running...
				if (currCommand.getStatus() === "running") {
					// Call its interrupted method
					currCommand.interrupted();
				}
				
				// If it is not a default Command, remove it from the queue
				if (!currCommand.isDefault())
					rawCommandQueue.splice(rawCommandQueue.indexOf(currCommand), 1);
			}
		}*/
		
		//var topCommand;
		var usedSubsystems = [];
		
		for (var i = commandQueue.length - 1; i >= 0; i--) {
			command = commandQueue[i];
			var canRun = command.canRun();
			
			/*if (canRun && !topCommand) {
				topCommand = command;
				usedSubsystems = usedSubsystems.concat(usedSubsystems, command.getRequirements());
			} else if (!canRun) {
				commandQueue.splice(i, 1);
				i++;
				continue;
			}*/
			
			if (usedSubsystems.length === numSubsystems || !canRun) {
				canRun = false;
			} else {
				for (var j = 0; j < command.getRequirements().length; j++) {
					if (usedSubsystems.indexOf(command.getRequirements()[j]) !== -1) {
						canRun = false;
						break;
					}
				}
			}
			
			// If the current Command can run...
			if (canRun) {
				// Its requirements are added to the Array of Subsystems in use
				usedSubsystems = usedSubsystems.concat(command.getRequirements());
				
				// The current Command is initialzed
				if (command.getStatus() === "idle")
					command.initialize();
				// The current Command is executed
				command.execute();
				
				// If the current Command is finished, its end function is called and it is removed from the queue if it is not a default Command
				if (command.isFinished()) {
					command.end();
					if (!command.isDefault()) {
						commandQueue.splice(i, 1);
						//i++;
					}
				}
			} else {
				// If the current Command is running...
				if (command.getStatus() === "running") {
					// Call its interrupted method
					command.interrupted();
				}
				
				// If it is not a default Command, remove it from the queue
				if (!command.isDefault()) {
					commandQueue.splice(i, 1);
					//i++;
				}
			}
		}
	}
}