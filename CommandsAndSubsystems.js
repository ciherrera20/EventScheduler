// Requires is a list of subsystems, and code is an object whose keys are functions
var CommandFactory = (function() {
	// An array of Commands in order from first added to last added
	var commandQueue = new Array();
	
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
								//status = "idle"; // Updates the Command's status to idle
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
								status = "finished"; // Updates the Command's status to finished
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "interrupted":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								status = "interrupted"; // Updates the Command's status to interrupted
								return temp(that);
							}
							
							return func;
						})();
						break;
					default:
						this[keyList[i]] = code[keyList[i]];
				}
			}
			
			// Adds the command to the commandQueue if it has not been added yet;
			/*var add = true;
			for (var i = 0; i < commandQueue.length; i++) {
				if (commandQueue[i].getCommandConstructorID() === this.getCommandConstructorID()) {
					add = false;
					break;
				}
			}
			if (add)
				addCommand(commandQueue, this);*/
			
			this.add = function() {
				var add = true;
				for (var i = 0; i < commandQueue.length; i++) {
					if (commandQueue[i].getCommandConstructorID() === that.getCommandConstructorID()) {
						add = false;
						break;
					}
				}
				if (add)
					addCommand(commandQueue, that);
			}
			
			this.remove = function() {
				var i = CommandFactory.getCommandQueue().indexOf(that);
				if (i !== -1)
					CommandFactory.getCommandQueue().splice(i, 1);
			}
			
			this.add();
			//CommandFactory.add(this);
		}
		
		// Adds the setDefault function to the CommandFactory constructor's prototype
		Command.setDefault = function() {
			if (priority === 0 && requires.length === 1)
				defaultCommand = true;
		}
		
		// Returns the Command constructor
		return Command;
	}
	
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
			if (command.getPriority() < queue[i].getPriority() && !queue[i].isDefault()) { // Otherwise, it is inserted below Commands of the same priority that were added before it (unless they are default Commands)
				queue.splice(i, 0, command); // Inserts the Command
				return;
			}
		}
	
		queue.push(command);
	}
	
	// Gets the commandQueue
	CommandFactory.getCommandQueue = function() {
		return commandQueue;
	}
	
	/*CommandFactory.add = function(command) {
		var add = true;
		for (var i = 0; i < commandQueue.length; i++) {
			if (commandQueue[i].getCommandConstructorID() === command.getCommandConstructorID()) {
				add = false;
				break;
			}
		}
		if (add)
			addCommand(commandQueue, command);
	}*/
	
	// Returns the CommandFactory constructor
	return CommandFactory;
})();
var a;
var CommandGroupFactory = (function() {
	var commandGroupQueue = [];
	
	var instances = 0;
	
	var CommandGroupFactory = function(commands) {
		// An ID assigned to the CommandGroupFactory
		var commandGroupConstructorID = instances++;
		
		for (var i = 0; i < commands.length; i++) {
			for (var j = 0; j < commands[i].length; j++) {
				commands[i][j].remove();
			}
		}
		
		var CommandGroup = function() {
			// For use in private functions
			var that = this;
			
			// A string describing the Command's status. Defaults to idle
			var status = "idle";
			
			// An index on the current sequential commands being run
			var sequentialIndex = 0;
			
			// Gets the current status of the Command
			this.getStatus = function() {
				return status;
			}
			
			// Gets the commandConstructorID of the CommandFactory that created this Command
			this.getCommandGroupConstructorID = function() {
				return commandGroupConstructorID;
			}
			
			// Checks the canRun function of all the commands in the commandGroup
			this.canRun = function() {
				for (var i = 0; i < commands[sequentialIndex].length; i++) {
					if (!commands[sequentialIndex][i].canRun())
						return false;
				}
				return true;
			}
			
			this.initialize = function() {
				status = "running";
				
				// Initialize the added flag for all of the commands to false
				for (var i = 0; i < commands.length; i++) {
					for (var j = 0; j < commands[i].length; j++) {
						commands[i][j].added = false;
					}
				}
			}
			
			this.execute = function() {
				// Flag to check if the current parallel commands are finished
				var sequentialFinished = true;
				
				// Flag to check if any of the current parallel commands have been interrupted
				var sequentialInterrupted = false;
				
				// Current command
				var command;
				
				for (var i = 0; i < commands[sequentialIndex].length; i++) {
					command = commands[sequentialIndex][i];
					if (!command.added) {
						command.add();
						command.added = true;
						sequentialFinished = false;
					} else {
						if (command.getStatus() !== "finished") {
							sequentialFinished = false;
						}
						
						if (command.getStatus() === "interupted" || (command.getStatus() !== "running" && command.getStatus() !== "finished")) {
							sequentialInterrupted = true;
							//console.log("interrupted");
						}
					}
				}
				
				if (sequentialInterrupted)
					status = "interrupted";
				
				if (sequentialFinished)
					sequentialIndex++;
			}
			
			this.isFinished = function() {
				return !(sequentialIndex < commands.length);
			}
			
			this.end = function() {
				status = "finished";
				sequentialIndex--;
			}
			
			this.interrupted = function() {
				status = "interrupted";
				for (var i = 0; i < commands[sequentialIndex].length; i++) {
					commands[sequentialIndex][i].remove();
				}
			}
		
			this.getRequirements = function() {
				return commands[sequentialIndex];
			}
		
			this.add = function() {
				// Adds the commandGroup to the commandGroupQueue if it has not been added yet;
				for (var i = 0; i < commandGroupQueue.length; i++) {
					if (commandGroupQueue[i].getCommandGroupConstructorID() === that.getCommandGroupConstructorID()) {
						commandGroupQueue.splice(i, 1);
						break;
					}
				}
				commandGroupQueue.push(that);
			}
			
			this.remove = function() {
				var i = CommandGroupFactory.getCommandGroupQueue().indexOf(that);
				if (i !== -1)
					CommandGroupFactory.getCommandGroupQueue().splice(i, 1);
			}
		
			this.add();
			//CommandGroupFactory.add(this);
		}
		
		return CommandGroup;
	}
	
	// Gets the commandQueue
	CommandGroupFactory.getCommandGroupQueue = function() {
		return commandGroupQueue;
	}
	
	/*CommandGroupFactory.add = function(commandGroup) {
		// Adds the commandGroup to the commandGroupQueue if it has not been added yet;
		for (var i = 0; i < commandGroupQueue.length; i++) {
			if (commandGroupQueue[i].getCommandGroupConstructorID() === this.getCommandGroupConstructorID()) {
				commandGroupQueue.splice(i, 1);
				break;
			}
		}
		commandGroupQueue.push(commandGroup);
	}*/
	
	return CommandGroupFactory;
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
		
		// Gets the Subsystem ID of this Subsystem
		this.getSubsystemID = function() {
			return subsystemID;
		}
		
		// The name of the Subsystem
		this.name = name;
		
		// Sets a CommandFactory to create default Commands, if one has not been set yet
		this.setDefaultCommand = function(CommandFactory) {
			if (!defaultCommand) {
				initDefault(CommandFactory);
			}
		}
	}
	
	// Adds the function getNumSubsystems to the constructor
	Subsystem.getNumSubsystems = function() {
		return instances;
	}
	
	// Returns the Subsystem constructor
	return Subsystem;
})();

if (!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	}
}