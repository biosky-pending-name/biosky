# Float/String Usage Audit

AT Protocol doesn't support floating point numbers. Audit all coordinate and decimal fields to ensure consistent representation.

## Fields to Audit

- [ ] `decimalLatitude` - occurrence records
- [ ] `decimalLongitude` - occurrence records
- [ ] Any other coordinate fields in lexicons
- [ ] Frontend form inputs and validation
- [ ] API request/response handling

## Decision Needed

Choose one approach for coordinates:
- **Strings** (matches ATProto community convention)
- **Scaled integers** (e.g., microdegrees - multiply by 1,000,000)

## References

- [AT Protocol Data Model](https://atproto.com/specs/data-model) - explains why floats are disallowed
- [Lexicon Community Location](https://github.com/lexicon-community/lexicon) - uses strings for lat/lon
