
module.exports = function() {
    return new function() {
        this.a = [];

        this.isEmpty = function() {
            if(this.a.length == 0) {
                return true;
            }
            return false;
        };

        this.length = function() {
            return this.a.length;
        };

        this.push = function(el) {
            this.a.push(el);
        };

        this.pop = function() {
            var el = this.a[0];
            this.a = this.a.slice(1, this.a.length);
            return el;
        };
    };
};