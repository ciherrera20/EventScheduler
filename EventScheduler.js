// Decides which commands should be running based off of their priorities and required subsystems
function EventScheduler() {
	// Runs an iteration of the EventScheduler
	this.loop = function() {
		// Gets the rawCommandQueue from the CommandFactory constructor
		var commandQueue = CommandFactory.getCommandQueue();
		
		// The number of Subsystems that have been created
		var numSubsystems = Subsystem.getNumSubsystems();
		
		// Holds the current Command being manipulated inside for loops
		var command;

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
				if (command.getStatus() !== "running")
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
		
		// The code below handles scheduling commanGroups based on what commands they require and which ones were added last
		
		var commandGroupQueue = CommandGroupFactory.getCommandGroupQueue();
		
		var commandGroup;
		
		var usedCommands = [];
		
		for (var i = commandGroupQueue.length - 1; i >= 0 ; i--) {
			commandGroup = commandGroupQueue[i];
			
			if (commandGroup.getStatus() === "interrupted") {
				commandGroupQueue.splice(i, 1);
				commandGroup.interrupted();
				continue;
			}
			
			var canRun = commandGroup.canRun();
			//console.log(canRun);
			
			if (canRun) {
				for (var j = 0; j < commandGroup.getRequirements().length; j++) {
					for (var k = 0; k < usedCommands.length; k++) {
						if (usedCommands[k].constructor === commandGroup.getRequirements()[j].constructor) {
							canRun = false;
							break;
						}
					}
					if (!canRun)
						break;
					//if (usedCommands.indexOf(commandGroup.getRequirements()[j]) !== -1) {
						//canRun = false;
						//break;
					//}
				}
			}
			
			//console.log(canRun);
			
			if (canRun) {
				// Its requirements are added to the Array of Commands in use
				usedCommands = usedCommands.concat(commandGroup.getRequirements());
				
				// The current Command is initialzed
				if (commandGroup.getStatus() !== "running")
					commandGroup.initialize();
				// The current Command is executed
				commandGroup.execute();
				
				// If the current Command is finished, its end function is called and it is removed from the queue if it is not a default Command
				if (commandGroup.isFinished()) {
					commandGroup.end();
					commandGroupQueue.splice(i, 1);
				}
			} else {
				// If the current CommandGroup is running...
				if (commandGroup.getStatus() === "running") {
					// Call its interrupted method
					commandGroup.interrupted();
				}
				
				commandGroupQueue.splice(i, 1);
			}
			
			/*if (!commandGroup.canRun()) {
				commandGroupQueue.splice(i, 1);
				i--;
				continue;
			}
			
			if (commandGroup.isFinished()) {
				commandGroup.end();
				commandGroupQueue.splice(i, 1);
				i--;
				continue;
			}
			
			if (commandGroup.getStatus() === "interrupted") {
				commandGroup.interrupted();
				commandGroupQueue.splice(i, 1);
				i--;
				continue;
			}
			
			if (commandGroup.getStatus() !== "running") {
				commandGroup.initialize();
			}
			
			commandGroup.execute();*/
		}
	}
}