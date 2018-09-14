function Footpath(departureStop, arrivalStop, duration) // Constructor
{
    this.departureStop = departureStop;
    this.arrivalStop = arrivalStop;
    this.duration = duration;
}

// Departure station of the footpath
Footpath.prototype.getDepartureStop = function()
{
    return this.departureStop;
};

// Arrival station of the footpath
Footpath.prototype.getArrivalStop = function() 
{
    return this.arrivalStop;
};

// Duration to get from departureStop to arrivalStop
Footpath.prototype.getDuration = function() 
{
    return this.duration;
}