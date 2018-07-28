// Requires is a list of subsystems, and code is an object whose keys are functions
var CommandFactory = (function() {
	// An array of Commands in order from first added to last added
	var rawCommandQueue = new Array();
	
	// Instances of CommandFactories created
	var instances = 0;
	
	// A CommandFactory to create commands
	var CommandFactory = function(requires, code, priority) {
		// Get a list of subsystemIDs from a list of subsystems
		function getRequirementIDs(requires) {
			var temp = new Array();
			for (var i = 0; i < requires.length; i++) {
				temp.push(requires[i].getSubsystemID());
			}
			return temp;
		}
		
		// Get the requirements for the command
		var requires = getRequirementIDs(requires);
		
		// An object containing functions that the Commands created with this CommandFactory will run and variables to be used in those functions
		var code = code;
		
		// The priority of Commands created with this CommandFactory
		var priority = priority;
		if (!priority) // Default to 0 if the priority is undefined or null
			priority = 0;
		
		// Adds the getRawCommandQueue function to the CommandFactory constructor
		if (!this.constructor.getRawCommandQueue) {
			// Gets the rawCommandQueue
			this.constructor.getRawCommandQueue = function() {
				return rawCommandQueue;
			}
		}
		
		// Adds the setDefault function to the CommandFactory constructor's prototype
		if (!this.constructor.__proto__.setDefault) {
			// Makes Commands created with this CommandFactory into default Commands
			this.constructor.__proto__.setDefault = function() {
				if (priority === 0 && requires.length === 1)
					defaultCommand = true;
			}
		}
		
		// Flag to check if Commands created with this CommandFactory are default Commands
		var defaultCommand = false;
		
		// An ID assigned to the CommandFactory
		var commandConstructorID = instances++;
		
		// Command constructor
		var Command = function() {
			// For use in private functions
			var that = this;
			
			// A string describing the Command's status. Defaults to idle
			var status = "idle";
			
			// Gets the current status of the Command
			this.getStatus = function() {
				return status;
			}
			
			// Gets the priority of the Command
			this.getPriority = function() {
				return priority;
			}
			
			// Gets a list of subsystems that the Command requires
			this.getRequirements = function() {
				return requires;
			}
			
			// Checks if the Command is a default Command
			this.isDefault = function() {
				return defaultCommand;
			}
			
			// Gets the commandConstructorID of the CommandFactory that created this Command
			this.getCommandConstructorID = function() {
				return commandConstructorID;
			}
			
			// Adds the keys from the code object to the Command instance
			var keyList = Object.keys(code);
			for (var i = 0; i < keyList.length; i++) {
				// Switch case for the canRun, intialize, execute, isFinished, end, and interrupted keys in order to modify the functions associated with them
				switch (keyList[i]) {
					case "canRun":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								// Add code here
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "initialize":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								status = "running"; // Updates the Command's status to running
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "execute":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								// Add code here
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "isFinished":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								// Add code here
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "end":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								status = "idle"; // Updates the Command's status to idle
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "interrupted":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								status = "idle"; // Updates the Command's status to idle
								return temp(that);
							}
							
							return func;
						})();
						break;
						
					this[keyList[i]] = code[keyList[i]];
				}
			}
			
			// Adds the command to the rawCommandQueue if it has not been added yet;
			var add = true;
			for (var i = 0; i < rawCommandQueue.length; i++) {
				if (rawCommandQueue[i].getCommandConstructorID() === this.getCommandConstructorID()) {
					add = false;
					break;
				}
			}
			if (add)
				rawCommandQueue.push(this);
		}
		
		// Returns the Command constructor
		return Command;
	}
	
	// Returns the CommandFactory constructor
	return CommandFactory;
})();

// Name is the name of the subsystem
var Subsystem = (function() {
	// The number of Subsystem instances that have been created
	var instances = 0;
	
	// The Subsystem constructor function
	var Subsystem = function(name) {
		// The subsystemID of this Subsystem
		var subsystemID = instances++;
		
		// A variable to hold the default Command if one is added
		var defaultCommand;
	
		// Sets the specified Command to a default Command and creates an instance of it
		function initDefault(CommandFactory) {
			CommandFactory.setDefault();
			defaultCommand = new CommandFactory();
		}
		
		// Adds the function getNumSubsystems to the constructor
		if (!this.constructor.getNumSubsystems) {
			// Gets the number of Subsystems that have been created
			this.constructor.getNumSubsystems = function() {
				return instances;
			}
		}
		
		// Gets the Subsystem ID of this Subsystem
		this.getSubsystemID = function() {
			return subsystemID;
		}
		
		// The name of the Subsystem
		this.name = name;
		
		// Sets a CommandFactory to create default Commands, if one has not been set yet
		this.setDefaultCommand = function(CommandFactory) {
			if (!defaultCommand)
				initDefault(CommandFactory);
		}
	}
	
	// Returns the Subsystem constructor
	return Subsystem;
})();

// Decides which commands should be running based off of their priorities and required subsystems
function EventScheduler() {
	// Runs an iteration of the EventScheduler
	this.loop = function() {
		// Gets the rawCommandQueue from the CommandFactory constructor
		var rawCommandQueue = CommandFactory.getRawCommandQueue();
		
		// A queue to hold commands ordered by priority
		var commandQueue = new Array();
		
		// Creates an Array with as many elements as Subsystems that have been created
		var subsystems = new Array(Subsystem.getNumSubsystems());
		
		// Holds the current Command being manipulated inside for loops
		var currCommand;
		
		// Function to add commands in order of priority to a queue
		function addCommand(queue, command) {
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
				if (i >= queue.length - 1) {
					queue.push(command);
					return;
				} else if (command.getPriority() <= queue[i].getPriority() && !queue[i].isDefault()) { // Otherwise, it is inserted below Commands of the same priority that were added before it (unless they are default Commands)
					queue.splice(i, 0, command); // Inserts the Command
					return;
				}
			}
		}
		
		// Loops through the raw command queue
		for (var i = 0; i < rawCommandQueue.length; i++) {
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
		}
		
		// If there are no Commands that require Subsystems, the loop ends here
		if (commandQueue.length === 0)
			return;
		
		// Adds Commands sorted by Subsystem and by priority into the subsystems Array
		for (var i = 0; i < commandQueue.length; i++) {
			currCommand = commandQueue[i];
			for (var j = 0; j < subsystems.length; j++) {
				if (!subsystems[j])
					subsystems[j] = new Array();
				if (currCommand.getRequirements().indexOf(j) === -1) {
					subsystems[j].push(0);
				} else {
					subsystems[j].push(currCommand);
				}
			}
		}
		
		var its = subsystems[0].length - 1, topRow, nextRow, newRow, canCombine;
		for (var i = its; i >= 1; i--) {
			// Get the top two rows of commands
			topRow = new Array();
			nextRow = new Array();
			newRow = new Array();
			canCombine = true;
			for (var j = 0; j < subsystems.length; j++) {
				topRow.push(subsystems[j][i]);
				nextRow.push(subsystems[j][i - 1]);
				
				// Create a hypothetical new row in case the two rows can combine
				if (topRow[j] === 0 && nextRow[j] !== 0)
					newRow[j] = nextRow[j];
				else
					newRow[j] = topRow[j];
				
				// Check if the two rows can combine or not
				if (topRow[j] !== 0 && nextRow[j] !== 0) {
					canCombine = false;
					if (nextRow[j].getStatus() === "running") {
						nextRow[j].interrupted();
						if (!nextRow[j].isDefault)
							rawCommandQueue.splice(rawCommandQueue.indexOf(nextRow[j]), 1);
					}
				}
				
				subsystems[j].splice(i - 1, 1);
			}
			
			// If the two rows can comibne, this code replaces the top row with the combined row
			if (canCombine) {
				for (var j = 0; j < subsystems.length; j++)	
					subsystems[j][i - 1] = newRow[j];
			}
		}
		
		// Run top priority commands whose subsystems are free
		for (var i = 0; i < subsystems.length; i++) {
			if (subsystems[i][0] !== 0) {
				currCommand = subsystems[i][0];
				if (currCommand.getStatus() === "idle") {
					currCommand.initialize();
				}
				currCommand.execute();
			}
		}
	}
}

if (!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	}
}