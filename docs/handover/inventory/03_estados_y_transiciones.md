# ZENPLUS — Estados y Transiciones

## Estados de Asset

DRAFT
UNDER_REVIEW
IN_REVIEW
AVAILABLE
RESERVED
SOLD

## Transiciones

DRAFT → IN_REVIEW
DRAFT → UNDER_REVIEW

IN_REVIEW → AVAILABLE
IN_REVIEW → DRAFT

UNDER_REVIEW → AVAILABLE
UNDER_REVIEW → DRAFT

AVAILABLE → RESERVED
AVAILABLE → IN_REVIEW
AVAILABLE → UNDER_REVIEW

RESERVED → SOLD
RESERVED → AVAILABLE

SOLD → estado final

## Nota

RESERVATION_HOLD es utilizado como estado/proyección temporal en el mecanismo de hold de Alpha y no debe asumirse automáticamente como equivalente al enum asset_status de Beta.
