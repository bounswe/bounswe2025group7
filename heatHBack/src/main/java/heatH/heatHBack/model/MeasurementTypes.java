package heatH.heatHBack.model;

public enum MeasurementTypes {
    GRAM(1.0),
    ML(1.0),
    TEASPOON(5.0),
    TABLESPOON(10.0),
    CUP(200.0);

    private final double gramEquivalent;

    MeasurementTypes(double gramEquivalent) {
        this.gramEquivalent = gramEquivalent;
    }

    public double getGramEquivalent() {
        return gramEquivalent;
    }

    public double toGrams(double amount) {
        return amount * this.gramEquivalent;
    }
}
