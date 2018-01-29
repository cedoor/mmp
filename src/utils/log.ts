/**
 * Manage console messages and errors.
 */
export default class Log {

    /**
     * Throw an Error with a message.
     * @param {ErrorMessage} message
     */
    static error(message: ErrorMessage) {
        throw new Error(message);
    }

    /**
     * Print an info message.
     * @param {string} message
     */
    static info(message: string) {
        console.log(message);
    }

    /**
     * Print a debug message.
     * @param {string} message
     */
    static debug(message: string) {
        console.debug(message);
    }

}

export enum ErrorMessage {
    incorrectEvent = "The event does not exist",
    incorrectKey = "The key does not exist in this map",
    incorrectSnapshot = "The snapshot is not correct",
    incorrectUpdateProperty = "The property does not exist",
    rootNodeDeletion = "The root node can not be deleted",
    imageExportLoading = "The image has not been loaded correctly",
    rootNodeBranches = "The root node has no branches",
    rootNodeLocking = "The root node can not be locked",
    nodeEmptyImage = "The node does not have an image"
}
